import React, { useState } from 'react'
import type { FunnelStage } from '../types'
import { GitCommit, AlertCircle, CheckCircle, XCircle, ChevronRight } from 'lucide-react'
import './FunnelBar.css'

const STAGE_META: Record<number, { title: string; subtitle: string; legitRationale: string; scamViolation: string }> = {
  0: {
    title: 'Application Acknowledged',
    subtitle: 'Candidate submits credentials',
    legitRationale: 'Candidate formally submits resume through verified career portal or ATS.',
    scamViolation: 'Scammers claim to have "reviewed your resume on LinkedIn" with zero prior application.'
  },
  1: {
    title: 'Screening Call',
    subtitle: 'Recruiter initial sync',
    legitRationale: 'HR or sourcer conducts a phone or video screen to verify qualifications and fit.',
    scamViolation: 'Skipped entirely to prevent candidate from hearing live voice or asking questions.'
  },
  2: {
    title: 'Technical Interview(s)',
    subtitle: 'Competency evaluation',
    legitRationale: 'Multiple interview rounds with hiring managers, assessment tasks, or panel discussions.',
    scamViolation: 'Explicitly bypassed ("No interview required, selected directly"). Real companies never hire without vetting.'
  },
  3: {
    title: 'Salary Negotiation',
    subtitle: 'Mutual term agreement',
    legitRationale: 'Two-way dialogue regarding compensation, benefits, and start date expectations.',
    scamViolation: 'Pre-set inflated salary presented as non-negotiable lure without discussion.'
  },
  4: {
    title: 'Written Offer Letter',
    subtitle: 'Official conditional terms',
    legitRationale: 'Official letterhead sent via secured HRMS portal or corporate domain email.',
    scamViolation: 'Issued instantaneously via Telegram, WhatsApp, or lookalike domain email.'
  },
  5: {
    title: 'Background Check',
    subtitle: 'Third-party reference check',
    legitRationale: 'Professional third-party verification (work history, identity, education) initiated by employer.',
    scamViolation: 'Skipped or fake "instant KYC verification" used to harvest victim identity documents.'
  },
  6: {
    title: 'Signed Agreement',
    subtitle: 'Formal employment binding',
    legitRationale: 'Candidate and company execute binding employment contract via DocuSign or physical signature.',
    scamViolation: 'Victim told offer will expire within 2 hours if fee is not immediately remitted.'
  },
  7: {
    title: 'IT & Payroll Onboarding',
    subtitle: 'Company provides equipment',
    legitRationale: 'Employer IT department ships pre-configured laptop directly; payroll collects tax forms.',
    scamViolation: 'CRITICAL TRAP: Candidate asked to pay upfront "refundable deposit" for equipment or training software.'
  }
}

interface FunnelBarProps {
  stages: FunnelStage[]
}

const FunnelBar = React.memo(function FunnelBar({ stages }: FunnelBarProps) {
  const [selectedStageId, setSelectedStageId] = useState<number>(0)

  // Ensure all 8 canonical stages are represented
  const canonicalStages: FunnelStage[] = Array.from({ length: 8 }).map((_, i) => {
    const existing = stages.find(s => s.id === i)
    return existing || {
      id: i,
      name: STAGE_META[i]?.title || `Stage ${i}`,
      status: 'unknown',
      evidence: null
    }
  })

  const presentCount = canonicalStages.filter(s => s.status === 'present').length
  const skippedCount = canonicalStages.filter(s => s.status === 'skipped').length
  const isHighCompression = skippedCount >= 4

  const activeMeta = STAGE_META[selectedStageId] || STAGE_META[0]
  const activeStage = canonicalStages[selectedStageId] || canonicalStages[0]

  return (
    <div className="funnel-card fade-in">
      {/* Header */}
      <div className="funnel-header">
        <div className="funnel-title-group">
          <div className="funnel-badge">
            <GitCommit size={15} className="funnel-badge-icon" />
            <span className="mono">PROCESS INTEGRITY PIPELINE</span>
          </div>
          <h3 className="card-title">Canonical Hiring Process Funnel</h3>
        </div>

        <div className="funnel-stats-cluster mono">
          <span className="stat-pill stat-pill--present">
            <CheckCircle size={12} /> {presentCount} Present
          </span>
          <span className="stat-pill stat-pill--skipped">
            <XCircle size={12} /> {skippedCount} Skipped
          </span>
          <span className="stat-pill stat-pill--ratio">
            Compression: <strong>{Math.round((skippedCount / 8) * 100)}%</strong>
          </span>
        </div>
      </div>

      {/* Structural Compression Alert */}
      {isHighCompression && (
        <div className="compression-alert">
          <AlertCircle size={18} className="alert-icon" />
          <div className="alert-text">
            <strong>Severe Funnel Collapse:</strong> {skippedCount} out of 8 standard hiring milestones were bypassed.
            The sender jumped directly from initial contact to financial commitment.
          </div>
        </div>
      )}

      {/* 8-Stage Interactive Process Graph */}
      <div className="funnel-stages-track">
        {canonicalStages.map((stage, idx) => {
          const isSelected = stage.id === selectedStageId
          const isPresent = stage.status === 'present'
          const isSkipped = stage.status === 'skipped'

          return (
            <React.Fragment key={stage.id}>
              <div
                className={`stage-node stage-node--${stage.status} ${isSelected ? 'stage-node--selected' : ''}`}
                onClick={() => setSelectedStageId(stage.id)}
                role="button"
                tabIndex={0}
              >
                <div className="stage-node-index mono">0{stage.id}</div>
                <div className="stage-status-icon">
                  {isPresent && <CheckCircle size={15} className="icon-check" />}
                  {isSkipped && <XCircle size={15} className="icon-skip" />}
                  {!isPresent && !isSkipped && <span className="icon-unknown">-</span>}
                </div>
                <span className="stage-node-title">{stage.name}</span>
                {stage.evidence && <span className="evidence-badge mono" title="Verified Evidence">EVID</span>}
              </div>

              {idx < canonicalStages.length - 1 && (
                <div className={`stage-connector ${isSkipped ? 'stage-connector--broken' : ''}`}>
                  <ChevronRight size={14} className="connector-chevron" />
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Selected Stage Detail Drawer */}
      <div className="stage-inspector-panel">
        <div className="inspector-top">
          <div className="inspector-title-row">
            <span className="inspector-stage-tag mono">STAGE 0{activeStage.id} ANALYSIS</span>
            <h4 className="inspector-title">{activeMeta.title}</h4>
          </div>
          <span
            className={`inspector-status-badge mono status-${activeStage.status}`}
          >
            {activeStage.status.toUpperCase()}
          </span>
        </div>

        <div className="inspector-grid">
          <div className="inspector-col">
            <span className="inspector-col-label">Legitimate Standard:</span>
            <p className="inspector-col-text">{activeMeta.legitRationale}</p>
          </div>
          <div className="inspector-col">
            <span className="inspector-col-label">Fraud Tactic / Risk Indicator:</span>
            <p className="inspector-col-text text-danger">{activeMeta.scamViolation}</p>
          </div>
        </div>

        {activeStage.evidence && (
          <div className="inspector-evidence-box mono">
            <div className="evidence-box-label">EXTRACTED EVIDENCE CITATION:</div>
            <p className="evidence-box-quote">"{activeStage.evidence}"</p>
          </div>
        )}
      </div>
    </div>
  )
})

export default FunnelBar
