import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { scanRouter } from './routes/scan'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json({ limit: '1mb' }))

app.use('/api/scan', scanRouter)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'fraudlens-backend' })
})

app.listen(PORT, () => {
  console.log(`✅ FraudLens backend running on http://localhost:${PORT}`)
})
