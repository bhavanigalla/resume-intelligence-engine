// The main (and only) page of the app.
import { useState } from 'react'
import UploadForm from '../components/UploadForm.jsx'
import ResultCard from '../components/ResultCard.jsx'
import { uploadResume, analyzeMatch } from '../services/api.js'

const STEPS = ['Reading your resume', 'Comparing with job description', 'Calculating match score']

export default function Home() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')

  async function handleSubmit(file, jobDescription) {
    setLoading(true)
    setError('')
    setResult(null)
    setStep(0)
    try {
      setStep(1)
      const uploaded = await uploadResume(file)
      setStep(2)
      const analyzed = await analyzeMatch(uploaded.text, jobDescription)
      setStep(3)
      await new Promise((r) => setTimeout(r, 300))
      setResult(analyzed)
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
        'Something went wrong. Make sure the backend server is running.'
      )
    } finally {
      setLoading(false)
      setStep(0)
    }
  }

  return (
    <div className="page">
      <h1>Resume Intelligence Engine</h1>
      <p className="subtitle">
        Upload a resume and a job description to see how well they match.
      </p>

      <UploadForm onSubmit={handleSubmit} loading={loading} />

      {loading && (
        <div className="card progress-card fade-in">
          {STEPS.map((label, i) => {
            const stepNum = i + 1
            const done = step > stepNum
            const active = step === stepNum
            return (
              <div key={label} className={`progress-step ${done ? 'done' : ''} ${active ? 'active' : ''}`}>
                <span className="progress-dot">{done ? '✓' : stepNum}</span>
                <span>{label}</span>
              </div>
            )
          })}
        </div>
      )}

      {error && <p className="error">{error}</p>}
      <ResultCard result={result} />
    </div>
  )
}