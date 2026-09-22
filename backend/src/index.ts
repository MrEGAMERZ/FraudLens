import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import { scanRouter } from './routes/scan'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Security & Efficiency Middleware stack
app.use(helmet())
app.use(compression())

// Rate Limiting (100 requests per 15 minutes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again later.' }
})
app.use('/api/', limiter)

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Structured HTTP Request Logger
app.use((req: Request, _res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] [HTTP] ${req.method} ${req.originalUrl} - IP: ${req.ip}`)
  next()
})

// Route Mounting
app.use('/api/scan', scanRouter)

// Health & Readiness Endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'fraudlens-backend',
    version: '1.2.0',
    capabilities: ['text-analysis', 'url-scraping', 'document-parsing (pdf, docx, txt)'],
    timestamp: new Date().toISOString()
  })
})

// 404 Catch-All
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: `Endpoint '${req.method} ${req.originalUrl}' not found.`
  })
})

// Global Exception Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[UNHANDLED_EXCEPTION]', err)
  res.status(500).json({
    error: 'An internal server error occurred. Please try again later.'
  })
})

// Only start listening if run directly (allows import in test suites)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`=======================================================`)
    console.log(`🛡️  FraudLens API Gateway running on http://localhost:${PORT}`)
    console.log(`📋  Modes Supported: Text | URL Link | Document Upload`)
    console.log(`=======================================================`)
  })
}

export default app
