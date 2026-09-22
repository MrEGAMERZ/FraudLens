import axios from 'axios'
import * as dns from 'dns/promises'
import * as tls from 'tls'
import type { DomainInfo } from '../types'

/**
 * Checks domain age via RDAP, MX records via DNS, and SSL issue date.
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

  // 2. SSL/TLS Certificate Check
  try {
    await new Promise<void>((resolve) => {
      const socket = tls.connect(
        {
          host: domain,
          port: 443,
          servername: domain,
          rejectUnauthorized: false,
          timeout: 4000
        },
        () => {
          const cert = socket.getPeerCertificate();
          socket.end();
          if (cert && cert.valid_from) {
            const validFrom = new Date(cert.valid_from);
            const issuedDaysAgo = Math.floor((Date.now() - validFrom.getTime()) / (1000 * 60 * 60 * 24));
            result.sslIssuedDaysAgo = issuedDaysAgo;
          }
          resolve();
        }
      );
      socket.on('error', () => resolve());
      socket.on('timeout', () => {
        socket.destroy();
        resolve();
      });
    });
  } catch {
    // TLS check failed - non-blocking
  }

  // 3. MX record lookup
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
