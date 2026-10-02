// Shows the match score as an animated gauge, plus matched/missing keywords.
import { useEffect, useState } from 'react'

function ScoreGauge({ score }) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (animatedScore / 100) * circumference

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 100)
    return () => clearTimeout(timer)
  }, [score])

  let color = '#b3261e'
  let label = 'Weak match'
  if (score >= 75) {
    color = '#1a7a34'
    label = 'Strong match'
  } else if (score >= 45) {
    color = '#c98a12'
    label = 'Partial match'
  }

  return (
    <div className="gauge-wrap">
      <svg width="170" height="170" viewBox="0 0 170 170">
        <circle
          cx="85" cy="85" r={radius}
          fill="none" stroke="#eef0fa" strokeWidth="14"
        />
        <circle
          cx="85" cy="85" r={radius}
          fill="none" stroke={color} strokeWidth="14"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 85 85)"
          style={{ transition: 'stroke-dashoffset 1s ease-out, stroke 0.3s ease' }}
        />
        <text x="85" y="80" textAnchor="middle" fontSize="34" fontWeight="700" fill="#1f2430">
          {Math.round(animatedScore)}%
        </text>
        <text x="85" y="104" textAnchor="middle" fontSize="12" fill="#888">
          match
        </text>
      </svg>
      <div className="gauge-label" style={{ color }}>{label}</div>
    </div>
  )
}

function Tag({ word, type }) {
  const [showTip, setShowTip] = useState(false)
  const tip = type === 'matched'
    ? `"${word}" appears in both the job description and your resume.`
    : `"${word}" is asked for in the job description but not found in your resume.`

  return (
    <span
      className={`tag ${type}`}
      onMouseEnter={() => setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
      onClick={() => setShowTip((v) => !v)}
    >
      {word}
      {showTip && <span className="tag-tip">{tip}</span>}
    </span>
  )
}

export default function ResultCard({ result }) {
  if (!result) return null

  const matched = Array.isArray(result.matched_skills)
    ? result.matched_skills
    : Array.isArray(result.matched_keywords)
      ? result.matched_keywords
      : []

  const missing = Array.isArray(result.missing_skills)
    ? result.missing_skills
    : Array.isArray(result.missing_keywords)
      ? result.missing_keywords
      : []

  return (
    <div className="card result-card fade-in">
      <ScoreGauge score={result.match_score} />
      <p className="result-summary">{result.summary}</p>

      <div className="result-section">
        <label>✅ Matched Keywords <span className="count">({matched.length})</span></label>
        <div className="tag-list">
          {matched.length === 0 && <span className="empty-hint">None found</span>}
          {matched.map((word) => (
            <Tag key={word} word={word} type="matched" />
          ))}
        </div>
      </div>

      <div className="result-section">
        <label>⚠️ Missing Keywords <span className="count">({missing.length})</span></label>
        <div className="tag-list">
          {missing.length === 0 && <span className="empty-hint">None — great coverage!</span>}
          {missing.map((word) => (
            <Tag key={word} word={word} type="missing" />
          ))}
        </div>
        {missing.length > 0 && (
          <p className="hint-text">💡 Tip: hover or tap a tag to see why it matters.</p>
        )}
      </div>
    </div>
  )
}