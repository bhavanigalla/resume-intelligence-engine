
// Helper functions for communicating with the Resume Intelligence Engine backend.

import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || '/api'

/**
 * Upload a resume file to the backend.
 */
export async function uploadResume(file) {
  if (!file) {
    throw new Error('Please select a resume file.')
  }

  const formData = new FormData()

  // The backend /api/upload endpoint expects the field name "file".
  formData.append('file', file, file.name)

  const response = await axios.post(
    `${API_BASE}/upload`,
    formData,
  )

  return response.data
}

/**
 * Analyze resume text against a job description.
 */
export async function analyzeMatch(
  resumeText,
  jobDescription,
) {
  if (!resumeText || !resumeText.trim()) {
    throw new Error('Resume text is empty.')
  }

  if (!jobDescription || !jobDescription.trim()) {
    throw new Error('Job description is empty.')
  }

  const response = await axios.post(
    `${API_BASE}/analyze`,
    {
      resume_text: resumeText,
      job_description: jobDescription.trim(),
    },
  )

  return response.data
}

