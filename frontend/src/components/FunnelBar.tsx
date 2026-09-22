import type { FunnelStage } from '../types'
import './FunnelBar.css'

const STAGE_NAMES = [
  'Application\nAcknowledged',
  'Screening\nCall',
  'Interview(s)',
  'Salary\nNegotiation',
  'Written\nOffer',
  'Background\nCheck',
  'Signed\nOffer',
  'Payroll\nOnboarding',
]

type Props = { stages: FunnelStage[] }

export default function FunnelBar({ stages }: Props) {
  const present = stages.filter(s => s.status === 'present').length
  const skipped = stages.filter(s => s.status === 'skipped').length

  return (
    <div className="funnel-card">
      <div className="funnel-header">
        <h3 className="card-title">Hiring Process Funnel</h3>
        <div className="funnel-stats">
          <span className="stat-present">✓ {present} present</span>
          <span className="stat-skipped">✗ {skipped} skipped</span>
        </div>
      </div>
      <p className="funnel-desc">
        A legitimate hiring process follows these 8 stages in order. Scams skip or collapse most of them.
      </p>
      <div className="funnel-stages">
        {stages.map((stage, i) => (
          <div key={i} className={`stage stage--${stage.status}`}>
            <div className="stage-number">{i + 1}</div>
            <div className="stage-name">{STAGE_NAMES[i] || stage.name}</div>
            <div className="stage-icon">
              {stage.status === 'present' ? '✓' : stage.status === 'skipped' ? '✗' : '?'}
            </div>
            {stage.evidence && (
              <div className="stage-evidence" title={stage.evidence}>
                <span className="evidence-dot" />
              </div>
            )}
            {i < stages.length - 1 && <div className="stage-connector" />}
          </div>
        ))}
      </div>
    </div>
  )
}
