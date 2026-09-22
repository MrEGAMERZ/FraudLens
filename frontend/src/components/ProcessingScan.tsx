import { useState, useEffect } from 'react'
import { Activity, ShieldCheck, Database, Binary, Cpu } from 'lucide-react'
import './ProcessingScan.css'

interface ProcessingScanProps {
  inputText?: string
}

const PHASES = [
  {
    step: 1,
    title: 'Extracting Forensic Entities',
    desc: 'Extracting company names, domains, payment handles, and cryptographic addresses...',
    icon: Binary
  },
  {
    step: 2,
    title: 'Analyzing Psychological Triggers',
    desc: 'Scanning for artificial scarcity, panic-inducing urgency, and isolation coercion...',
    icon: Activity
  },
  {
    step: 3,
    title: 'Querying Infrastructure Signals',
    desc: 'Inspecting RDAP domain registration age, SSL cert chains, and MX mail routes...',
    icon: Database
  },
  {
    step: 4,
    title: 'Classifying Fraud Funnel Process Graph',
    desc: 'Comparing message sequence against canonical 8-stage hiring/rental milestones...',
    icon: Cpu
  },
  {
    step: 5,
    title: 'Synthesizing Threat Intelligence Report',
    desc: 'Computing weighted Scam Threat Index and generating defense recommendations...',
    icon: ShieldCheck
  }
]

export default function ProcessingScan({ inputText }: ProcessingScanProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [elapsed, setElapsed] = useState(0.0)

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(prev => +(prev + 0.1).toFixed(1))
    }, 100)

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => (prev < PHASES.length - 1 ? prev + 1 : prev))
    }, 1200)

    return () => {
      clearInterval(timer)
      clearInterval(stepInterval)
    }
  }, [])

  const currentPhase = PHASES[currentStep]
  const IconComponent = currentPhase.icon
  const progressPercent = Math.min(Math.round(((currentStep + 1) / PHASES.length) * 100), 96)

  return (
    <div className="processing-container fade-in">
      <div className="processing-card">
        {/* Laser Sweep Scanner Effect */}
        <div className="laser-sweep-beam" />
        <div className="laser-grid-overlay" />

        {/* Content Preview with Wireframe */}
        <div className="scanner-wireframe-header">
          <div className="wireframe-status-strip">
            <span className="live-dot" />
            <span className="mono status-badge-text">NEURAL X-RAY PIPELINE ACTIVE</span>
            <span className="mono elapsed-timer">T+{elapsed}s</span>
          </div>
          <div className="process-progress-bar-track">
            <div className="process-progress-bar-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        {/* Text Snippet Under Inspection */}
        {inputText && (
          <div className="inspected-text-snippet mono">
            <div className="snippet-glitch-header">SCAN TARGET BUFFER:</div>
            <p className="snippet-body-text">
              {inputText.length > 280 ? `${inputText.slice(0, 280)}...` : inputText}
            </p>
          </div>
        )}

        {/* Dynamic Status Phase */}
        <div className="phase-display-box">
          <div className="phase-icon-bubble">
            <IconComponent className="phase-icon-svg" size={24} />
          </div>
          <div className="phase-text-group">
            <div className="phase-counter mono">PHASE 0{currentPhase.step} / 0{PHASES.length}</div>
            <h4 className="phase-headline">{currentPhase.title}</h4>
            <p className="phase-explanation">{currentPhase.desc}</p>
          </div>
        </div>

        {/* Steps Breadcrumbs */}
        <div className="steps-row">
          {PHASES.map((p, index) => {
            const isDone = index < currentStep
            const isCurrent = index === currentStep
            return (
              <div
                key={p.step}
                className={`step-pip ${isDone ? 'step-pip--done' : isCurrent ? 'step-pip--active' : ''}`}
              >
                <div className="pip-dot">{isDone ? '✓' : p.step}</div>
                <span className="pip-title">{p.title.split(' ')[0]}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
