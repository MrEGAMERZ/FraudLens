import { Router, Request, Response, NextFunction } from 'express'
import multer from 'multer'
import axios from 'axios'
import { checkDomain } from '../services/domain'
import { fusionScore } from '../services/fusion'
import { extractTextFromBuffer } from '../services/extractor'
import { scrapeUrlContent } from '../services/urlScraper'
import { runLocalProcessJudge } from '../services/localJudge'
import crypto from 'crypto'
import type { ScanResult, DomainInfo } from '../types'

export const scanRouter = Router()

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000'

// Simple in-memory cache for efficiency
const scanCache = new Map<string, ScanResult>()
const CACHE_TTL_MS = 1000 * 60 * 60 // 1 hour

// Configure Multer for in-memory file uploads with a 25MB boundary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
    files: 1
  }
})

function getCacheKey(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex')
}

/**
 * Universal evaluation pipeline for all ingestion sources (Text, URL, Document Upload).
 */
async function executeScan(
  text: string,
  directDomain?: string,
  scanStartTime: number = Date.now()
): Promise<ScanResult> {
  const cleanText = text.trim()
  if (cleanText.length < 20) {
    throw new Error('Input text is too short to analyze (minimum 20 characters required).')
  }

  // Check Cache First (Efficiency Optimization)
  const cacheKey = getCacheKey(cleanText)
  if (scanCache.has(cacheKey)) {
    console.log(`[CACHE HIT] Returning cached scan result for hash ${cacheKey.slice(0,8)}...`)
    const cachedResult = scanCache.get(cacheKey)!
    return { ...cachedResult, processingTimeMs: Date.now() - scanStartTime }
  }

  // 1. Process Classification via ML microservice, with graceful fallback to local heuristic judge
  let mlData: any
  try {
    const mlResponse = await axios.post(
      `${ML_SERVICE_URL}/judge`,
      { text: cleanText },
      { timeout: 15000 }
    )
    mlData = mlResponse.data
  } catch (err: any) {
    console.warn(`[SCAN_PIPELINE] ML service unavailable or timed out (${err.message}). Engaging resilient local process judge.`)
    mlData = runLocalProcessJudge(cleanText)
  }

  // 2. Resolve Domain for Infrastructure Inspection (RDAP + TLS + MX)
  const candidateDomain =
    directDomain ||
    mlData.extracted_domain ||
    mlData.extractedDomain ||
    cleanText.match(/[\w.-]+@([\w.-]+\.[a-zA-Z]{2,})/)?.[1]

  let domainInfo: DomainInfo
  if (candidateDomain && candidateDomain.includes('.')) {
    try {
      domainInfo = await checkDomain(candidateDomain)
    } catch {
      domainInfo = { domain: candidateDomain, error: 'Domain verification timed out' }
    }
  } else {
    domainInfo = { error: 'No verifiable domain detected' }
  }

  // 3. Multi-Signal Fusion & Scoring
  const elapsedMs = Date.now() - scanStartTime
  const result = fusionScore(mlData, domainInfo, elapsedMs)

  console.log(`[SCAN_AUDIT] Completed scan in ${elapsedMs}ms | Verdict: ${result.verdict.toUpperCase()} (Threat Index: ${result.scamThreatIndex}/100)`)
  scanCache.set(cacheKey, result)
  return result
}

/**
 * POST /api/scan
 * Universal endpoint accepting JSON { text, url } or Multipart with 'file'.
 */
scanRouter.post('/', upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now()

  try {
    // Case 1: Document File Upload
    if (req.file) {
      console.log(`[SCAN_REQUEST] Received file upload '${req.file.originalname}' (${req.file.size} bytes, ${req.file.mimetype})`)
      const extracted = await extractTextFromBuffer(req.file.buffer, req.file.mimetype, req.file.originalname)
      const result = await executeScan(extracted.text, undefined, startTime)
      return res.json(result)
    }

    const { text, url } = req.body

    // Case 2: Web URL / Phishing Link
    if (url && typeof url === 'string' && url.trim()) {
      console.log(`[SCAN_REQUEST] Received URL scan target: ${url.trim()}`)
      const scraped = await scrapeUrlContent(url.trim())
      const result = await executeScan(scraped.text, scraped.domain, startTime)
      return res.json(result)
    }

    // Case 3: Raw Text Snippet
    if (text && typeof text === 'string' && text.trim()) {
      console.log(`[SCAN_REQUEST] Received text snippet scan (${text.trim().length} chars)`)
      const result = await executeScan(text, undefined, startTime)
      return res.json(result)
    }

    return res.status(400).json({
      error: 'Invalid request. Please provide either a text snippet, a valid web URL, or upload a document file (PDF, DOCX, TXT).'
    })
  } catch (err: any) {
    next(err)
  }
})

/**
 * POST /api/scan/upload
 * Dedicated file upload endpoint for documents (PDF, DOCX, TXT).
 */
scanRouter.post('/upload', upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now()

  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded. Please attach a document under the "file" field.'
      })
    }

    console.log(`[SCAN_UPLOAD] Processing document '${req.file.originalname}' (${req.file.size} bytes)`)
    const extracted = await extractTextFromBuffer(req.file.buffer, req.file.mimetype, req.file.originalname)
    const result = await executeScan(extracted.text, undefined, startTime)
    return res.json(result)
  } catch (err: any) {
    next(err)
  }
})

/**
 * Central Route Error Handler
 */
scanRouter.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: 'Uploaded file is too large. Maximum supported document size is 25MB.'
      })
    }
    return res.status(400).json({ error: `File upload error: ${err.message}` })
  }

  console.error('[SCAN_ERROR]', err.message)
  return res.status(400).json({
    error: err.message || 'An error occurred during security scan evaluation.'
  })
})
