/**
 * Comprehensive Backend Verification Test Suite
 * Tests:
 * 1. Health Endpoint
 * 2. Mode 1: Text Scanning (Scam & Legit samples, plus validation edge cases)
 * 3. Mode 2: URL Scanning (SSRF guard validation + live public URL extraction)
 * 4. Mode 3: Document Upload (PDF extraction + TXT upload + error handling on empty files)
 */
import axios from 'axios'
import FormData from 'form-data'
import * as fs from 'fs'
import * as path from 'path'
import app from '../src/index'

const PORT = 3099
const BASE_URL = `http://127.0.0.1:${PORT}`

const DEMO_SCAM_TEXT = `Dear Applicant,
We are pleased to inform you that after reviewing your resume on LinkedIn, you have been selected for the position of Remote Data Entry Specialist at TechGlobal Solutions Inc.
You are required to pay a one-time refundable security deposit of ₹4,999 via UPI to confirm your position. This must be done within 2 hours or your offer will be revoked. No interview is required — you have been directly selected. Joining date is immediate.
Please transfer to: 9876543210@paytm
hr@techglobal-solutions-india.net`

const DEMO_LEGIT_TEXT = `Dear Mohammed Rehan,
Thank you for completing your final interview with our engineering team last Thursday. We were impressed with your problem-solving approach and technical depth.
We are pleased to extend an official offer for the role of Software Engineer - II at Bangalore office. Salary: ₹18 LPA. Start date: 1st November 2026.
This offer is contingent on a standard background verification, which our HR team will initiate by email from verify@infosys.com. No payment or deposit is required from your side at any point.
Priya Sharma, Talent Acquisition
Infosys Limited`

async function runTests() {
  console.log('\n🚀 Starting FraudLens Backend Multi-Modal Test Suite...\n')

  const server = app.listen(PORT)
  let passed = 0
  let failed = 0

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`)
      passed++
    } else {
      console.error(`  ❌ FAIL: ${testName} ${detail ? `(${detail})` : ''}`)
      failed++
    }
  }

  try {
    // ----------------------------------------------------
    // TEST 1: Health & Readiness Check
    // ----------------------------------------------------
    console.log('--- [1/4] Health Check ---')
    const healthRes = await axios.get(`${BASE_URL}/api/health`)
    assert(healthRes.status === 200, 'GET /api/health returns 200 OK')
    assert(healthRes.data.service === 'fraudlens-backend', 'Service identifies as fraudlens-backend')
    assert(Array.isArray(healthRes.data.capabilities), 'Capabilities list returned')

    // ----------------------------------------------------
    // TEST 2: Mode 1 - Text Snippet Scanning
    // ----------------------------------------------------
    console.log('\n--- [2/4] Mode 1: Text Scanning ---')

    // 2a. Obvious Scam Text
    const scamRes = await axios.post(`${BASE_URL}/api/scan`, { text: DEMO_SCAM_TEXT })
    assert(scamRes.status === 200, 'POST /api/scan with scam text returns 200 OK')
    assert(scamRes.data.verdict === 'scam', `Scam detected as verdict: '${scamRes.data.verdict}'`)
    assert(scamRes.data.scamThreatIndex >= 61, `High ScamThreatIndex: ${scamRes.data.scamThreatIndex}/100`)
    assert(scamRes.data.signals.ffcs >= 80, `FFCS flagged high process compression (${scamRes.data.signals.ffcs})`)
    assert(scamRes.data.signals.financialAsk >= 80, `Financial ask flagged (${scamRes.data.signals.financialAsk})`)
    assert(scamRes.data.funnelStages.length === 8, 'Returns 8 canonical process stages')

    // 2b. Legitimate Offer Text
    const legitRes = await axios.post(`${BASE_URL}/api/scan`, { text: DEMO_LEGIT_TEXT })
    assert(legitRes.status === 200, 'POST /api/scan with legit text returns 200 OK')
    assert(legitRes.data.verdict === 'legitimate', `Legit offer detected as verdict: '${legitRes.data.verdict}'`)
    assert(legitRes.data.scamThreatIndex <= 30, `Low ScamThreatIndex: ${legitRes.data.scamThreatIndex}/100`)

    // 2c. Input Validation: Text too short
    try {
      await axios.post(`${BASE_URL}/api/scan`, { text: 'too short' })
      assert(false, 'Validation catches short text (<20 chars)')
    } catch (err: any) {
      assert(err.response?.status === 400, 'Validation returns 400 Bad Request on short text')
    }

    // ----------------------------------------------------
    // TEST 3: Mode 2 - URL Scraping & SSRF Protection
    // ----------------------------------------------------
    console.log('\n--- [3/4] Mode 2: URL Scanning & SSRF Security ---')

    // 3a. SSRF Protection: Loopback / Private IP Block
    try {
      await axios.post(`${BASE_URL}/api/scan`, { url: 'http://127.0.0.1:3099/api/health' })
      assert(false, 'SSRF filter blocks internal loopback URL')
    } catch (err: any) {
      assert(err.response?.status === 400, 'SSRF filter correctly rejected private IP with 400')
      assert(err.response?.data?.error?.includes('restricted') || err.response?.data?.error?.includes('private'), 'SSRF error message is clear')
    }

    // 3b. SSRF Protection: Cloud metadata IP
    try {
      await axios.post(`${BASE_URL}/api/scan`, { url: 'http://169.254.169.254/latest/meta-data/' })
      assert(false, 'SSRF filter blocks AWS metadata IP')
    } catch (err: any) {
      assert(err.response?.status === 400, 'SSRF filter blocked metadata IP with 400')
    }

    // 3c. Public Web Page Scanning
    const publicUrlRes = await axios.post(`${BASE_URL}/api/scan`, { url: 'https://example.com' })
    assert(publicUrlRes.status === 200, 'Scrapes public URL and returns 200 OK')
    assert(publicUrlRes.data.domainInfo?.domain === 'example.com', 'Directly extracted domain from URL (example.com)')
    assert(typeof publicUrlRes.data.scamThreatIndex === 'number', 'Generated Scam Threat Index for URL')

    // ----------------------------------------------------
    // TEST 4: Mode 3 - Document Upload (PDF & TXT)
    // ----------------------------------------------------
    console.log('\n--- [4/4] Mode 3: Document Upload Processing ---')

    // 4a. Upload Plain Text (.txt) File to /api/scan/upload
    const txtForm = new FormData()
    txtForm.append('file', Buffer.from(DEMO_SCAM_TEXT), {
      filename: 'fraudulent_offer_letter.txt',
      contentType: 'text/plain'
    })
    const txtRes = await axios.post(`${BASE_URL}/api/scan/upload`, txtForm, {
      headers: txtForm.getHeaders()
    })
    assert(txtRes.status === 200, 'POST /api/scan/upload with .txt file returns 200 OK')
    assert(txtRes.data.verdict === 'scam', 'Detected scam inside uploaded .txt file')

    // 4b. Upload Real PDF Document
    const pdfPath = '/Users/rehan/Developer/PromtWars/_PROMPTWARS X GEN AI Document.pdf'
    if (fs.existsSync(pdfPath)) {
      const pdfBuffer = fs.readFileSync(pdfPath)
      const pdfForm = new FormData()
      pdfForm.append('file', pdfBuffer, {
        filename: 'PromptWars_Rules.pdf',
        contentType: 'application/pdf'
      })
      const pdfRes = await axios.post(`${BASE_URL}/api/scan`, pdfForm, {
        headers: pdfForm.getHeaders()
      })
      assert(pdfRes.status === 200, 'POST /api/scan with real PDF returns 200 OK')
      assert(pdfRes.data.funnelStages.length === 8, 'Parsed PDF and returned 8 canonical stages')
      assert(typeof pdfRes.data.scamThreatIndex === 'number', `PDF ScamThreatIndex computed: ${pdfRes.data.scamThreatIndex}`)
    } else {
      console.log('  ⚠️ Note: PDF sample not found on disk, skipping live PDF check.')
    }

    // 4c. Upload Empty File Handling
    try {
      const emptyForm = new FormData()
      emptyForm.append('file', Buffer.from(''), {
        filename: 'empty.txt',
        contentType: 'text/plain'
      })
      await axios.post(`${BASE_URL}/api/scan/upload`, emptyForm, {
        headers: emptyForm.getHeaders()
      })
      assert(false, 'Rejected empty file')
    } catch (err: any) {
      assert(err.response?.status === 400, 'Returns 400 on empty file upload')
      assert(err.response?.data?.error?.includes('empty'), 'Clear error message on empty file')
    }

    // 4d. Missing File in /api/scan/upload
    try {
      await axios.post(`${BASE_URL}/api/scan/upload`, {})
      assert(false, 'Rejected request with no file attached')
    } catch (err: any) {
      assert(err.response?.status === 400, 'Returns 400 when file is missing')
    }

  } catch (error: any) {
    console.error('💥 Unexpected test error:', error?.response?.data || error.message)
    failed++
  } finally {
    server.close()
    console.log(`\n==================================================`)
    console.log(`🏁 Test Summary: ${passed} PASSED | ${failed} FAILED`)
    console.log(`==================================================\n`)
    process.exit(failed > 0 ? 1 : 0)
  }
}

runTests()
