
// Resume upload form with PDF/DOCX validation and drag-and-drop support.

import { useRef, useState } from 'react'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const ALLOWED_EXTENSIONS = ['.pdf', '.docx']

function formatFileSize(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function UploadForm({ onSubmit, loading }) {
  const [file, setFile] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [fileError, setFileError] = useState('')

  const inputRef = useRef(null)

  function validateAndSetFile(candidate) {
    if (!candidate) {
      return
    }

    const filename = candidate.name || ''
    const lowerName = filename.toLowerCase()

    const isAllowedType = ALLOWED_EXTENSIONS.some((extension) =>
      lowerName.endsWith(extension),
    )

    if (!isAllowedType) {
      setFile(null)
      setFileError('Only .pdf and .docx files are supported.')

      if (inputRef.current) {
        inputRef.current.value = ''
      }

      return
    }

    if (candidate.size === 0) {
      setFile(null)
      setFileError('The selected file is empty.')

      if (inputRef.current) {
        inputRef.current.value = ''
      }

      return
    }

    if (candidate.size > MAX_FILE_SIZE) {
      setFile(null)
      setFileError('The resume must be smaller than 10 MB.')

      if (inputRef.current) {
        inputRef.current.value = ''
      }

      return
    }

    setFileError('')
    setFile(candidate)
  }

  function handleDrop(event) {
    event.preventDefault()
    setIsDragging(false)

    const droppedFile = event.dataTransfer.files?.[0]

    validateAndSetFile(droppedFile)
  }

  function handleDragOver(event) {
    event.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(event) {
    event.preventDefault()
    setIsDragging(false)
  }

  function handleBrowseClick() {
    if (!loading) {
      inputRef.current?.click()
    }
  }

  function handleFileInputChange(event) {
    const selectedFile = event.target.files?.[0]

    validateAndSetFile(selectedFile)
  }

  function removeFile(event) {
    event.stopPropagation()

    setFile(null)
    setFileError('')

    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleBrowseClick()
    }
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (!file) {
      setFileError('Please select a PDF or DOCX resume.')
      return
    }

    if (!jobDescription.trim()) {
      return
    }

    /*
     * The parent component is responsible for creating FormData.
     * It MUST append the file using the field name "resume".
     */
    onSubmit(file, jobDescription.trim())
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <label htmlFor="resume-file">
        1. Upload your resume (PDF or DOCX)
      </label>

      <div
        className={`dropzone ${isDragging ? 'dragging' : ''} ${
          file ? 'has-file' : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label="Upload resume"
      >
        <input
          id="resume-file"
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileInputChange}
          disabled={loading}
          hidden
        />

        {!file && (
          <div className="dropzone-empty">
            <div className="dropzone-icon">📄</div>

            <p className="dropzone-text">
              <strong>Drag & drop</strong> your resume here, or{' '}
              <span className="dropzone-link">browse</span>
            </p>

            <p className="dropzone-hint">
              PDF or DOCX, up to 10 MB
            </p>
          </div>
        )}

        {file && (
          <div className="dropzone-file">
            <div className="file-icon">✓</div>

            <div className="file-info">
              <div className="file-name">
                {file.name}
              </div>

              <div className="file-size">
                {formatFileSize(file.size)}
              </div>
            </div>

            <button
              type="button"
              className="file-remove"
              onClick={removeFile}
              disabled={loading}
              aria-label="Remove file"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {fileError && (
        <p className="error" role="alert">
          {fileError}
        </p>
      )}

      <label
        htmlFor="job-desc"
        style={{ marginTop: '20px' }}
      >
        2. Paste the job description
      </label>

      <textarea
        id="job-desc"
        placeholder="Paste the job posting text here..."
        value={jobDescription}
        onChange={(event) => setJobDescription(event.target.value)}
        disabled={loading}
      />

      <button
        type="submit"
        disabled={
          loading ||
          !file ||
          !jobDescription.trim()
        }
      >
        {loading ? 'Analyzing...' : 'Analyze Match'}
      </button>
    </form>
  )
}

