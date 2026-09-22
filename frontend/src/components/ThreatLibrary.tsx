import { useState } from 'react'
import type { ThreatLibraryEntry } from '../types'
import { BookOpen, Search, ChevronRight, Zap } from 'lucide-react'
import './ThreatLibrary.css'

interface ThreatLibraryProps {
  onSelectArchetype: (payload: string) => void
}

export const THREAT_ARCHETYPES: ThreatLibraryEntry[] = [
  {
    id: 'advance-fee-onboarding',
    title: 'Advance-Fee Remote Equipment Scam',
    category: 'Employment',
    severity: 'CRITICAL',
    avgVictimLoss: '$1,200 – $4,800 (₹25,000 – ₹1,50,000)',
    summary: 'Candidate is contacted out of the blue or targeted on LinkedIn for an attractive remote job. Without substantive technical or behavioral interviews, an immediate offer is extended with a mandate to remit funds for "refundable laptop insurance" or "pre-configured software licenses".',
    funnelSkipPattern: 'Stages 1 (Screening), 2 (Interviews), and 3 (Negotiations) are skipped. Stage 7 (Payroll/IT) is inverted into candidate-funded remittance.',
    canonicalStagesSkipped: [1, 2, 3, 5],
    primaryIoCs: [
      'Newly registered domain (< 30 days old)',
      'Consumer P2P payment channels (UPI, Paytm, Zelle, CashApp)',
      'Sender uses generic free mailbox or typo-squatted brand'
    ],
    psychologicalTactics: [
      'Panic Urgency ("Confirm within 2 hours or offer is revoked")',
      'Flattery & Artificial Direct Selection ("Resume impressed executive team")',
      'False Guarantee ("100% refundable upon onboarding")'
    ],
    samplePayload: `Dear Applicant,

We are pleased to inform you that after reviewing your profile on LinkedIn, you have been selected for the position of Remote Operations Analyst at TechGlobal Enterprise Solutions.

You are required to pay a one-time refundable security deposit of ₹4,999 via UPI to confirm your position and release your hardware shipment. This must be completed within 2 hours or your position will be offered to the next candidate. No interview is required — you have been directly selected based on your stellar background.

Please transfer immediately to UPI: 9876543210@paytm
HR Department, TechGlobal Enterprise Solutions
hr@techglobal-solutions-india.net`
  },
  {
    id: 'rental-sublease-wire',
    title: 'Sublease Deposit & Pre-Viewing Wire Trap',
    category: 'Real Estate',
    severity: 'CRITICAL',
    avgVictimLoss: '$1,800 – $5,500',
    summary: 'Fraudster scrapes legitimate property listings and reposts them at 40% below market rent. When prospective tenants inquire, the "landlord" claims to be overseas or in medical quarantine, demanding a security deposit via bank wire or crypto before granting access to view the keys.',
    funnelSkipPattern: 'Bypasses in-person walk-through, physical key handover, formal credit screening, and escrow security deposit handling.',
    canonicalStagesSkipped: [1, 2, 5, 6],
    primaryIoCs: [
      'Host requests cryptocurrency, Wire, or Venmo friends & family',
      'Images reverse-match active MLS listings in other cities',
      'Refusal of in-person property viewing'
    ],
    psychologicalTactics: [
      'Extreme Scarcity ("15 other applicants waiting to wire deposit")',
      'Emotional Manipulation ("Inherited property, just want good Christian tenant")',
      'Immediate Payment Coupling'
    ],
    samplePayload: `Hello Prospective Tenant,

Thank you for your interest in our 2-Bedroom Luxury Suite at 104 Riverside Drive. The monthly rent is $1,100 including all utilities.

I am currently away in London on missionary work so I am unable to meet in person to show the apartment. However, the keys are locked with FedEx courier. Due to overwhelming demand, I require a refundable $1,200 holding deposit via Zelle or Wire Transfer to reserve the apartment and ship you the lockbox code.

Once transfer is confirmed, keys will arrive by morning. If you dislike the place after viewing, 100% of your deposit will be refunded instantly.

Zelle ID: leasing-director@fastmail-secure.com
Owner: Dr. Alexander Wright`
  },
  {
    id: 'telegram-vip-task',
    title: 'Telegram Task & Rating Pyramid Scheme',
    category: 'Task & Gig',
    severity: 'HIGH',
    avgVictimLoss: '$500 – $15,000',
    summary: 'Victims receive unsolicited WhatsApp/SMS messages offering $50-$200/day for liking YouTube videos or submitting app ratings. After initial tiny payouts to build trust, victims are coerced into "recharging" cryptocurrency accounts with thousands of dollars to unlock "VIP task commissions".',
    funnelSkipPattern: 'Lacks any legal employment contract, tax ID collection, or standard payroll. Replaces legitimate work with synthetic web tasks.',
    canonicalStagesSkipped: [0, 1, 2, 3, 4, 5, 6],
    primaryIoCs: [
      'Recruitment initiates via WhatsApp from international country code (+62, +234, +44)',
      'Communication strictly redirected to encrypted Telegram channel',
      'Cryptocurrency (USDT TRC-20) wallet addresses used for payouts'
    ],
    psychologicalTactics: [
      'Gamification & Sunken Cost Fallacy',
      'Bait Payouts (Paying real $10 to extract $2,000 later)',
      'Group Pressure (Fabricated screenshots of other users claiming huge earnings)'
    ],
    samplePayload: `Hi! I am Emma from Global Talent HR.

We have flexible part-time remote opportunities where you can earn ₹3,000 to ₹8,000 daily by simply rating travel destinations on Google and liking YouTube channels! Each task takes only 3 minutes.

You will be paid ₹500 immediately for completing your trial tasks right now. No educational qualification or previous experience needed. Daily payouts via UPI or USDT.

Contact our assigned manager on Telegram now: @GlobalTaskSupport_Official
Join code: VIP-9081`
  },
  {
    id: 'ghost-employer-impersonation',
    title: 'Ghost Employer & Executive Impersonation',
    category: 'Executive Impersonation',
    severity: 'CRITICAL',
    avgVictimLoss: '$3,500 + Full Identity Theft',
    summary: 'Scammers create lookalike domains imitating Fortune 500 companies (e.g. amazon-careers-global.net, microsoft-talent-portal.org) and conduct text-only interviews via Microsoft Teams chat. Victims surrender SSNs, bank details, and pay for remote workstation setup.',
    funnelSkipPattern: 'Replaces video/in-person panel interviews with text chat or questionnaire forms. Uses forged corporate stationery.',
    canonicalStagesSkipped: [1, 2, 3],
    primaryIoCs: [
      'Lookalike typo-squatted domains with deceptive subdomains',
      'Free or newly created email addresses claiming executive titles',
      'Requests for candidate banking credentials prior to start date'
    ],
    psychologicalTactics: [
      'Authority Bias (Exploiting reputable corporate brand names)',
      'Confidentiality Gag ("Do not contact local branch until onboarding completes")',
      'Simulated Bureaucracy (Multi-page PDF questionnaires)'
    ],
    samplePayload: `Dear Candidate,

The Talent Acquisition Board at Amazon Cloud Services has evaluated your application. We are pleased to offer you the position of Senior Cloud Consultant (Remote).

Compensation: $145,000 USD base + full health benefits.

Due to corporate confidentiality protocols, you must conduct your onboarding briefing via Microsoft Teams chat with our Director of Staffing, Mr. David Miller (teams ID: david-amazon-hr@consultant.com).

To complete compliance, please submit a high-resolution scan of your passport, driver's license, and voided bank check for direct deposit setup to our onboarding portal within 24 hours.

Amazon Corporate Talent Acquisition Team
https://amazon-cloud-careers-portal.net`
  },
  {
    id: 'fake-check-reimbursement',
    title: 'Fake Check & Overpayment Supply Trap',
    category: 'Employment',
    severity: 'CRITICAL',
    avgVictimLoss: '$2,500 – $7,000',
    summary: 'The "employer" sends a counterfeit cashier check for $5,000 to cover "home office equipment". The candidate deposits the check, which banks legally make temporarily available. The employer then instructs the candidate to quickly wire $3,500 to their "approved vendor" for equipment before the check inevitably bounces.',
    funnelSkipPattern: 'Inverts supply chain logistics: real companies order equipment directly from approved vendors and ship to employee; scammers make employee the intermediary payment conduit.',
    canonicalStagesSkipped: [1, 2, 5, 7],
    primaryIoCs: [
      'Electronic or paper checks delivered via FedEx with instructions for mobile deposit',
      'Demands to wire money via Zelle, Western Union, or Bitcoin ATM to a third-party vendor',
      'Urgency to transfer before check clearing cycle completes'
    ],
    psychologicalTactics: [
      'Illusory Liquidity (Exploiting bank temporary funds availability laws)',
      'Moral Obligation ("It is company money, you are simply facilitating IT procurement")',
      'Aggressive Harassment once candidate hesitates'
    ],
    samplePayload: `Dear Jordan,

Welcome to Apex Medical Systems! As discussed in your interview summary, we are providing a $4,850 equipment allowance for your home office.

A cashier's check #849204 has been issued to your name and emailed for mobile deposit. Please deposit this check immediately into your account. Once your bank shows the balance as available, transfer $3,900 to our certified workstation vendor via Zelle (vendor-logistics@apex-equip.com) to ship your Apple MacBook Pro and dual monitors. You may keep the remaining $950 as your signing bonus.

Please acknowledge receipt and confirm when deposit is completed.

Apex Medical Systems Recruiting`
  },
  {
    id: 'offshore-visa-courier',
    title: 'Offshore Relocation & Fake Visa Courier Scam',
    category: 'Immigration',
    severity: 'HIGH',
    avgVictimLoss: '$3,000 – $9,000',
    summary: 'Candidates in developing nations receive unsolicited offers from luxury hotels or oil companies in Dubai, Canada, or Singapore with astronomical salaries. The victim is directed to a fake "authorized immigration attorney" who demands fees for work permits, medical clearance, and courier dispatch.',
    funnelSkipPattern: 'Completely circumvents official government consulate portals and labor sponsorship filings.',
    canonicalStagesSkipped: [1, 2, 5],
    primaryIoCs: [
      'Unsolicited foreign job offer without candidate ever applying or interviewing abroad',
      'Direct payment demands for government visa fees into personal bank accounts',
      'Official-looking seals, stamps, and forged immigration department logos'
    ],
    psychologicalTactics: [
      'Life-Changing Aspiration (Exploiting desire for overseas career migration)',
      'Artificial Legal Authority (Forged attorney and ministry documentation)',
      'Sunk Cost Escalation (Small initial fee followed by escalating security bonds)'
    ],
    samplePayload: `OFFICIAL EMPLOYMENT APPOINTMENT LETTER — EMIRATES PETROLEUM CO.

Dear Job Seeker,

We are delighted to confirm your appointment as Chief Logistics Specialist at our Abu Dhabi facility.
Monthly Salary: 32,000 AED ($8,700 USD) + free accommodation + annual flight allowances.

In accordance with UAE Ministry of Human Resources regulations, all expatriate candidates must process their Residence Visa and Work Permit through our accredited legal representative, Al-Tamimi Immigration Consultants.

Please contact advocate Tariq Mansoor at al-tamimi-legal@uae-permits.com and remit 4,200 AED for diplomatic courier processing and medical clearance fees within 72 hours. Our company will reimburse 100% of these expenses upon arrival at Dubai International Airport.`
  }
]

export default function ThreatLibrary({ onSelectArchetype }: ThreatLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [expandedId, setExpandedId] = useState<string | null>('advance-fee-onboarding')

  const categories = ['All', 'Employment', 'Real Estate', 'Task & Gig', 'Executive Impersonation', 'Immigration']

  const filteredArchetypes = THREAT_ARCHETYPES.filter(entry => {
    const matchesCategory = selectedCategory === 'All' || entry.category === selectedCategory
    const matchesSearch =
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.primaryIoCs.some(ioc => ioc.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  return (
    <div className="threat-library-page fade-in">
      {/* Library Hero Banner */}
      <div className="library-hero">
        <div className="library-badge mono">
          <BookOpen size={15} className="library-badge-icon" />
          <span>CYBER FRAUD TAXONOMY & INTELLIGENCE ARCHIVE</span>
        </div>
        <h1 className="library-title">Threat Intel Library</h1>
        <p className="library-subtitle">
          Comprehensive repository of cataloged fraud funnels, process collapse patterns, and real-world attack archetypes. 
          Select any threat vector to inspect structural indicators or load directly into the Neural X-Ray Scanner.
        </p>

        {/* Search & Filter Controls */}
        <div className="library-controls-bar">
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search threat vectors by archetype, IoC, or psychological trigger..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="category-pill-group">
            {categories.map(cat => (
              <button
                key={cat}
                className={`category-pill ${selectedCategory === cat ? 'category-pill--active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Catalog Cards Grid */}
      <div className="archetype-grid">
        {filteredArchetypes.map(entry => {
          const isExpanded = expandedId === entry.id
          const isCrit = entry.severity === 'CRITICAL'

          return (
            <div
              key={entry.id}
              className={`archetype-card ${isExpanded ? 'archetype-card--expanded' : ''}`}
            >
              <div className="archetype-card-top">
                <div className="card-meta-row">
                  <span className="category-tag mono">{entry.category}</span>
                  <span className={`severity-tag mono ${isCrit ? 'tag-crit' : 'tag-high'}`}>
                    {entry.severity}
                  </span>
                </div>
                <h3 className="archetype-title">{entry.title}</h3>
                <p className="archetype-summary">{entry.summary}</p>
              </div>

              {/* Quick stats */}
              <div className="archetype-stats-strip mono">
                <div className="stat-item">
                  <span className="stat-label">Average Victim Loss:</span>
                  <span className="stat-val text-amber">{entry.avgVictimLoss}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Skipped Milestones:</span>
                  <span className="stat-val text-danger">{entry.canonicalStagesSkipped.length} Stages Bypassed</span>
                </div>
              </div>

              {/* Collapsible Details */}
              {isExpanded && (
                <div className="archetype-expanded-content fade-in">
                  <div className="detail-section">
                    <h5 className="detail-heading">Process Funnel Collapse Pattern:</h5>
                    <p className="detail-text">{entry.funnelSkipPattern}</p>
                  </div>

                  <div className="detail-section">
                    <h5 className="detail-heading">Signature Indicators of Compromise (IoCs):</h5>
                    <ul className="ioc-bullet-list mono">
                      {entry.primaryIoCs.map((ioc, i) => (
                        <li key={i}>{ioc}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="detail-section">
                    <h5 className="detail-heading">Psychological Manipulation Tactics:</h5>
                    <div className="tactics-chips-row">
                      {entry.psychologicalTactics.map((tactic, i) => (
                        <span key={i} className="tactic-chip mono">{tactic}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Footer */}
              <div className="archetype-card-footer">
                <button
                  className="btn-toggle-details"
                  onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                >
                  {isExpanded ? 'Hide Technical Anatomy' : 'Inspect Process Anatomy'}
                  <ChevronRight size={14} className={`chevron-icon ${isExpanded ? 'chevron-rotated' : ''}`} />
                </button>

                <button
                  className="btn-load-scanner"
                  onClick={() => onSelectArchetype(entry.samplePayload)}
                >
                  <Zap size={14} />
                  <span>Load into Scanner</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
