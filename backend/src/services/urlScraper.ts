import axios from 'axios'
import * as dns from 'dns/promises'

export interface ScrapedPageResult {
  text: string
  domain: string
  url: string
  title?: string
}

/**
 * Checks if an IPv4 address is in a private/restricted network range.
 */
function isPrivateIp(ip: string): boolean {
  if (!ip) return true

  // IPv6 localhost / private
  if (ip === '::1' || ip.startsWith('fe80:') || ip.startsWith('fc00:') || ip.startsWith('fd00:')) {
    return true
  }

  const parts = ip.split('.').map(Number)
  if (parts.length !== 4 || parts.some(isNaN)) return true

  // 127.0.0.0/8 (Loopback)
  if (parts[0] === 127) return true
  // 10.0.0.0/8 (Private)
  if (parts[0] === 10) return true
  // 172.16.0.0/12 (Private)
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true
  // 192.168.0.0/16 (Private)
  if (parts[0] === 192 && parts[1] === 168) return true
  // 169.254.0.0/16 (Link-local / Cloud metadata API)
  if (parts[0] === 169 && parts[1] === 254) return true
  // 0.0.0.0
  if (parts[0] === 0) return true

  return false
}

/**
 * Validates a target URL against SSRF and protocol restrictions.
 */
async function validateUrlSafety(targetUrl: string): Promise<URL> {
  let parsed: URL
  try {
    parsed = new URL(targetUrl)
  } catch {
    throw new Error('Invalid URL format. Please provide a valid HTTP or HTTPS address.')
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(`Unsupported URL protocol '${parsed.protocol}'. Only HTTP and HTTPS are permitted.`)
  }

  const hostname = parsed.hostname.toLowerCase()

  // Block obvious localhost / internal hostnames
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal')
  ) {
    throw new Error('Access to private or local hostnames is blocked for security.')
  }

  // Resolve hostname and verify resolved IP is public (SSRF prevention)
  try {
    const lookup = await dns.lookup(hostname)
    if (isPrivateIp(lookup.address)) {
      throw new Error(`Target address resolves to a restricted internal network (${lookup.address}). Request blocked.`)
    }
  } catch (err: any) {
    if (err.message && err.message.includes('restricted internal network')) {
      throw err
    }
    throw new Error(`Could not resolve hostname '${hostname}': ${err.message}`)
  }

  return parsed
}

/**
 * Strips HTML tags and boilerplate to produce clean readable text for analysis.
 */
function cleanHtml(html: string): { title: string; cleanText: string } {
  // 1. Extract title if present
  let title = ''
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  if (titleMatch) {
    title = titleMatch[1].trim()
  }

  // 2. Strip scripts, styles, iframes, SVG, noscript, nav, header, footer
  let processed = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, ' ')
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, ' ')
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ')
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, ' ')
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')

  // 3. Strip remaining HTML tags
  processed = processed.replace(/<[^>]+>/g, ' ')

  // 4. Decode HTML entities
  processed = processed
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')

  // 5. Normalize whitespace
  processed = processed.replace(/\s+/g, ' ').trim()

  return { title, cleanText: processed }
}

/**
 * Safely fetches a remote URL and extracts clean textual content.
 */
export async function scrapeUrlContent(targetUrl: string): Promise<ScrapedPageResult> {
  const parsed = await validateUrlSafety(targetUrl)

  try {
    const response = await axios.get(targetUrl, {
      timeout: 8000,
      maxContentLength: 3 * 1024 * 1024, // 3MB limit
      headers: {
        'User-Agent': 'FraudLens-Security-Scanner/1.0 (+https://fraudlens.io)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    })

    const contentType = response.headers['content-type'] || ''
    const rawData = typeof response.data === 'string' ? response.data : JSON.stringify(response.data)

    const { title, cleanText } = cleanHtml(rawData)

    const combinedText = title ? `[PAGE TITLE: ${title}]\n\n${cleanText}` : cleanText

    if (combinedText.length < 30) {
      throw new Error(`The target web page returned insufficient analyzable text (${combinedText.length} characters). It may require JavaScript rendering or user authentication.`)
    }

    return {
      text: combinedText.slice(0, 6000), // Cap at 6,000 chars for LLM reasoning
      domain: parsed.hostname,
      url: targetUrl,
      title
    }
  } catch (err: any) {
    if (err.response) {
      throw new Error(`Target website returned HTTP ${err.response.status} ${err.response.statusText}.`)
    }
    if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
      throw new Error('Target website took too long to respond (timed out after 8s).')
    }
    throw new Error(`Failed to fetch web content from URL: ${err.message}`)
  }
}
