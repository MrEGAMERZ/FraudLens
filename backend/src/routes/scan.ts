import { Router, Request, Response } from 'express'
import axios from 'axios'
import { checkDomain } from '../services/domain'
import { fusionScore } from '../services/fusion'

export const scanRouter = Router()

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000'

scanRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { text, url } = req.body

    if (!text && !url) {
      return res.status(400).json({ error: 'Provide either text or url' })
    }

    // 1. Call ML service for LLM-based signals (FFCS, financial ask, linguistic)
    const mlResponse = await axios.post(`${ML_SERVICE_URL}/judge`, { text, url }, { timeout: 25000 })
    const mlData = mlResponse.data

    // 2. Run domain checks (RDAP + SSL + MX) if domain is extractable
    const domainInfo = mlData.extractedDomain
      ? await checkDomain(mlData.extractedDomain).catch(() => ({ error: 'Domain check failed' }))
      : { error: 'No domain detected in text' }

    // 3. Fuse all signals into final score
    const result = fusionScore(mlData, domainInfo)

    return res.json(result)
  } catch (err: any) {
    console.error('Scan error:', err.message)
    return res.status(500).json({
      error: err?.response?.data?.detail || 'Internal scan error. Is the ML service running?'
    })
  }
})
