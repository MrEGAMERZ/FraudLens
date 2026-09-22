import { useState } from 'react'
import type { Evidence } from '../types'
import { FileText, Info } from 'lucide-react'
import './AnnotatedSourceText.css'

interface AnnotatedSourceTextProps {
  text: string
  evidence: Evidence[]
}

interface HighlightSpan {
  start: number
  end: number
  text: string
  signal: string
  reason: string
  severity: 'critical' | 'warning' | 'info'
}

export default function AnnotatedSourceText({ text, evidence }: AnnotatedSourceTextProps) {
  const [activeTooltip, setActiveTooltip] = useState<{
    text: string
    reason: string
    signal: string
    severity: string
    x: number
    y: number
  } | null>(null)

  // Find occurrences of evidence strings in the source text
  const spans: HighlightSpan[] = []
  
  evidence.forEach(e => {
    if (!e.text || e.text.length < 3) return
    const searchStr = e.text.trim()
    let searchIndex = 0
    
    while (searchIndex < text.length) {
      const idx = text.toLowerCase().indexOf(searchStr.toLowerCase(), searchIndex)
      if (idx === -1) break
      
      const isFinancial = e.signal === 'financialAsk'
      const severity: HighlightSpan['severity'] = isFinancial ? 'critical' : 'warning'

      spans.push({
        start: idx,
        end: idx + searchStr.length,
        text: text.substring(idx, idx + searchStr.length),
        signal: e.signal,
        reason: e.reason,
        severity
      })
      searchIndex = idx + searchStr.length
    }
  })

  // Sort spans by start index
  spans.sort((a, b) => a.start - b.start)

  // Construct text chunks
  const chunks: Array<{ isHighlight: boolean; content: string; span?: HighlightSpan }> = []
  let lastIndex = 0

  spans.forEach(span => {
    if (span.start > lastIndex) {
      chunks.push({
        isHighlight: false,
        content: text.slice(lastIndex, span.start)
      })
    }
    if (span.start >= lastIndex) {
      chunks.push({
        isHighlight: true,
        content: text.slice(span.start, span.end),
        span
      })
      lastIndex = span.end
    }
  })

  if (lastIndex < text.length) {
    chunks.push({
      isHighlight: false,
      content: text.slice(lastIndex)
    })
  }

  const handleSpanClick = (e: React.MouseEvent, span: HighlightSpan) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setActiveTooltip({
      text: span.text,
      reason: span.reason,
      signal: span.signal,
      severity: span.severity,
      x: rect.left,
      y: rect.bottom + 8
    })
  }

  const criticalCount = spans.filter(s => s.severity === 'critical').length
  const warningCount = spans.filter(s => s.severity === 'warning').length

  return (
    <div className="annotated-text-card fade-in">
      <div className="annotated-text-header">
        <div className="annotated-title-row">
          <div className="annotated-badge">
            <FileText size={15} className="annotated-badge-icon" />
            <span className="mono">FORENSIC SOURCE INSPECTOR</span>
          </div>
          <h3 className="card-title">Annotated Target Text</h3>
        </div>

        <div className="annotated-legend mono">
          <span className="legend-chip legend-chip--critical">
            <span className="chip-dot chip-dot--red" /> Critical Vector ({criticalCount})
          </span>
          <span className="legend-chip legend-chip--warning">
            <span className="chip-dot chip-dot--yellow" /> Manipulation ({warningCount})
          </span>
        </div>
      </div>

      <p className="annotated-instructions">
        <Info size={14} className="instruction-icon" />
        Interactive highlights: Click or hover any highlighted phrase to inspect detected psychological triggers and fraud indicators.
      </p>

      {/* Rendered Text Viewer */}
      <div className="annotated-text-content mono">
        {chunks.length === 0 ? (
          <span className="text-raw">{text}</span>
        ) : (
          chunks.map((chunk, idx) => {
            if (!chunk.isHighlight || !chunk.span) {
              return <span key={idx} className="text-raw">{chunk.content}</span>
            }

            const span = chunk.span
            const isCrit = span.severity === 'critical'
            const highlightClass = isCrit
              ? 'highlight-span highlight-span--critical'
              : 'highlight-span highlight-span--warning'

            return (
              <mark
                key={idx}
                className={highlightClass}
                onClick={(e) => handleSpanClick(e, span)}
                title={span.reason}
              >
                {chunk.content}
                <span className="highlight-tag mono">{isCrit ? 'CRITICAL' : 'TACTIC'}</span>
              </mark>
            )
          })
        )}
      </div>

      {/* Floating Inspector Popover */}
      {activeTooltip && (
        <div
          className="inspector-popover fade-in"
          style={{
            top: `${Math.min(activeTooltip.y, window.innerHeight - 200)}px`,
            left: `${Math.min(activeTooltip.x, window.innerWidth - 340)}px`
          }}
        >
          <div className="popover-header">
            <span className={`popover-badge mono badge-${activeTooltip.severity}`}>
              {activeTooltip.severity.toUpperCase()} SIGNAL
            </span>
            <button
              className="popover-close-btn"
              onClick={() => setActiveTooltip(null)}
            >
              ✕
            </button>
          </div>
          <div className="popover-quote mono">"{activeTooltip.text}"</div>
          <div className="popover-body">
            <span className="popover-label">Tactical Analysis:</span>
            <p className="popover-reason">{activeTooltip.reason}</p>
          </div>
        </div>
      )}
    </div>
  )
}
