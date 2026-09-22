import axios from 'axios'
import * as dns from 'dns/promises'
import type { DomainInfo } from '../types'

/**
 * Checks domain age via RDAP, MX records via DNS.
 * No API key required — RDAP is free and keyless.
 */
export async function checkDomain(domain: string): Promise<DomainInfo> {
  const result: DomainInfo = { domain }

  // 1. RDAP domain age
  try {
    const rdapUrl = `https://rdap.org/domain/${domain}`
    const { data } = await axios.get(rdapUrl, { timeout: 8000 })

    // RDAP events: look for registration date
    const events: Array<{ eventAction: string; eventDate: string }> = data.events || []
    const regEvent = events.find(e => e.eventAction === 'registration')
    if (regEvent) {
      const regDate = new Date(regEvent.eventDate)
      const ageDays = Math.floor((Date.now() - regDate.getTime()) / (1000 * 60 * 60 * 24))
      result.domainAgeDays = ageDays
    }

    result.registrar = data.entities
      ?.find((e: any) => e.roles?.includes('registrar'))
      ?.vcardArray?.[1]?.find((v: any) => v[0] === 'fn')?.[3] || 'Unknown'
  } catch {
    // RDAP failed — non-blocking
  }

  // 2. MX record lookup
  try {
    const mx = await dns.resolveMx(domain)
    const topMx = mx.sort((a, b) => a.priority - b.priority)[0]?.exchange || ''
    if (topMx.includes('google') || topMx.includes('googlemail')) result.mxProvider = 'Google Workspace'
    else if (topMx.includes('outlook') || topMx.includes('microsoft')) result.mxProvider = 'Microsoft 365'
    else if (topMx.includes('protonmail') || topMx.includes('proton.ch')) result.mxProvider = 'ProtonMail'
    else if (topMx.includes('zoho')) result.mxProvider = 'Zoho Mail'
    else result.mxProvider = topMx || 'Unknown'
  } catch {
    result.mxProvider = 'No MX records'
  }

  return result
}
