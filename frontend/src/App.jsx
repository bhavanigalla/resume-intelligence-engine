import { useState } from "react";
import "./styles.css";

const API_URL = import.meta.env.VITE_API_URL || "/api/analyze";

function App() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // FILE UPLOAD
  // =====================================================

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedExtensions = ["pdf", "doc", "docx"];

    const extension = file.name
      .split(".")
      .pop()
      ?.toLowerCase();

    if (!extension || !allowedExtensions.includes(extension)) {
      setError("Please upload a PDF, DOC, or DOCX resume.");
      setResumeFile(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10 MB.");
      setResumeFile(null);
      return;
    }

    setResumeFile(file);
    setAnalysis(null);
    setError("");
  };

  // =====================================================
  // ANALYZE
  // =====================================================

  const handleAnalyze = async () => {
    setError("");
    setAnalysis(null);

    if (!resumeFile) {
      setError("Please upload your resume first.");
      return;
    }

    if (!jobDescription.trim()) {
      setError("Please paste the job description first.");
      return;
    }

    setLoading(true);

    const formData = new FormData();

    formData.append("resume", resumeFile);
    formData.append("job_description", jobDescription.trim());

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      const contentType = response.headers.get("content-type");

      let data;

      if (contentType?.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();

        data = {
          detail: text,
        };
      }

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            "Resume analysis failed."
        );
      }

      setAnalysis(data);

      setTimeout(() => {
        document
          .getElementById("analysis-result")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }, 150);
    } catch (err) {
      console.error("Analysis error:", err);

      if (
        err?.message?.includes("Failed to fetch")
      ) {
        setError(
          "Cannot connect to the backend. Make sure FastAPI is running."
        );
      } else {
        setError(
          err?.message ||
            "Something went wrong while analyzing your resume."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // NAVIGATION
  // =====================================================

  const scrollToSection = (id) => {
    document
      .getElementById(id)
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  // =====================================================
  // RESET
  // =====================================================

  const handleReset = () => {
    setResumeFile(null);
    setJobDescription("");
    setAnalysis(null);
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="app">

      {/* =================================================
          NAVBAR
      ================================================= */}

      <nav className="navbar">

        <div className="brand">

          <div className="logo">
            RI
          </div>

          <div className="brand-text">

            <span className="brand-name">
              Resume Intelligence
            </span>

            <span className="brand-subtitle">
              AI Career Assistant
            </span>

          </div>

        </div>

        <div className="nav-links">

          <button
            onClick={() =>
              scrollToSection("home")
            }
          >
            Home
          </button>

          <button
            onClick={() =>
              scrollToSection("analyzer")
            }
          >
            Analyzer
          </button>

          <button
            onClick={() =>
              scrollToSection("features")
            }
          >
            Features
          </button>

          <button
            className="nav-btn"
            onClick={() =>
              scrollToSection("analyzer")
            }
          >
            Get Started
          </button>

        </div>

      </nav>

      {/* =================================================
          HERO
      ================================================= */}

      <section
        id="home"
        className="hero"
      >

        <div className="hero-badge">
          <span>✦</span>
          AI-Powered Resume Analysis
        </div>

        <h1>
          Make Your Resume
          <span> Job-Ready.</span>
        </h1>

        <p className="hero-description">
          Compare your resume with any job description,
          identify missing skills, and understand exactly
          where your resume stands.
        </p>

        <div className="hero-buttons">

          <button
            className="primary-btn"
            onClick={() =>
              scrollToSection("analyzer")
            }
          >
            Analyze My Resume
            <span>→</span>
          </button>

          <button
            className="secondary-btn"
            onClick={() =>
              scrollToSection("features")
            }
          >
            Explore Features
          </button>

        </div>

        <div className="trust">

          <span>
            <b>✓</b>
            Smart Matching
          </span>

          <span>
            <b>✓</b>
            Skill Detection
          </span>

          <span>
            <b>✓</b>
            Instant Results
          </span>

        </div>

      </section>

      {/* =================================================
          ANALYZER
      ================================================= */}

      <section
        id="analyzer"
        className="analyzer-section"
      >

        <div className="section-heading">

          <div className="small-label">
            RESUME ANALYZER
          </div>

          <h2>
            Know Your Resume's
            <span> Strength</span>
          </h2>

          <p>
            Upload your resume and provide the target
            job description to get a detailed compatibility
            analysis.
          </p>

        </div>

        <div className="analyzer-card">

          {/* =================================================
              RESUME INPUT
          ================================================= */}

          <div className="input-card">

            <div className="card-top">

              <div className="step-number">
                01
              </div>

              <div className="card-icon">
                📄
              </div>

            </div>

            <h3>
              Upload Your Resume
            </h3>

            <p>
              Upload the resume you want to analyze.
            </p>

            <label
              className={`upload-box ${
                resumeFile
                  ? "upload-box-selected"
                  : ""
              }`}
            >

              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
              />

              {resumeFile ? (
                <>
                  <div className="upload-icon success">
                    ✓
                  </div>

                  <strong>
                    {resumeFile.name}
                  </strong>

                  <span className="file-selected">
                    Resume selected successfully
                  </span>

                  <small>
                    Click to replace file
                  </small>
                </>
              ) : (
                <>
                  <div className="upload-icon">
                    ↑
                  </div>

                  <strong>
                    Drop your resume here
                  </strong>

                  <span>
                    or click to browse files
                  </span>

                  <small>
                    PDF, DOC, DOCX • Max 10MB
                  </small>
                </>
              )}

            </label>

          </div>

          {/* =================================================
              JOB DESCRIPTION
          ================================================= */}

          <div className="input-card">

            <div className="card-top">

              <div className="step-number">
                02
              </div>

              <div className="card-icon">
                💼
              </div>

            </div>

            <h3>
              Job Description
            </h3>

            <p>
              Paste the job description you want to target.
            </p>

            <textarea
              className="job-input"
              placeholder={`Example:

We are looking for a Python developer with experience in AWS, React, SQL, Docker and REST APIs...`}
              value={jobDescription}
              onChange={(event) =>
                setJobDescription(
                  event.target.value
                )
              }
            />

            <div className="input-footer">

              <span className="character-count">
                {jobDescription.length} characters
              </span>

              <span>
                {jobDescription.trim()
                  ? "Ready"
                  : "Waiting for job description"}
              </span>

            </div>

            <button
              className="analyze-btn"
              onClick={handleAnalyze}
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="spinner"></span>
                  Analyzing Resume...
                </>
              ) : (
                <>
                  <span>✦</span>
                  Analyze Match
                  <span>→</span>
                </>
              )}

            </button>

          </div>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="error-box">

            <div className="error-icon">
              !
            </div>

            <div>
              <strong>
                Analysis could not be completed
              </strong>

              <p>
                {error}
              </p>
            </div>

          </div>
        )}

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <LoadingAnalysis />
        )}

        {/* =================================================
            RESULT
        ================================================= */}

        {analysis && !loading && (
          <AnalysisResult
            analysis={analysis}
            onReset={handleReset}
          />
        )}

      </section>

      {/* =================================================
          FEATURES
      ================================================= */}

      <section
        id="features"
        className="features-section"
      >

        <div className="section-heading">

          <div className="small-label">
            WHY USE IT?
          </div>

          <h2>
            Everything You Need to
            <span> Stand Out</span>
          </h2>

          <p>
            Understand your resume from the perspective
            of the job you actually want.
          </p>

        </div>

        <div className="features-grid">

          <FeatureCard
            icon="🎯"
            title="Smart Matching"
            text="Compare resume content against the actual requirements of a job description."
          />

          <FeatureCard
            icon="📊"
            title="Match Score"
            text="Get a clear compatibility score based on the skills and keywords detected."
          />

          <FeatureCard
            icon="🔎"
            title="Missing Skills"
            text="See which important skills from the job description are not present in your resume."
          />

          <FeatureCard
            icon="⚡"
            title="Instant Insights"
            text="Get useful analysis immediately without manually comparing your resume and JD."
          />

        </div>

      </section>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer>

        <div className="footer-brand">

          <div className="logo">
            RI
          </div>

          <strong>
            Resume Intelligence
          </strong>

        </div>

        <p>
          AI-powered career intelligence for your next opportunity.
        </p>

        <span>
          © 2026 Resume Intelligence Engine
        </span>

      </footer>

    </div>
  );
}


// =====================================================
// LOADING COMPONENT
// =====================================================

function LoadingAnalysis() {
  return (
    <div className="loading-card">

      <div className="loading-spinner-large"></div>

      <div>

        <strong>
          Analyzing your resume
        </strong>

        <p>
          Comparing your skills with the job requirements...
        </p>

      </div>

      <div className="loading-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>

    </div>
  );
}


// =====================================================
// FEATURE CARD
// =====================================================

function FeatureCard({
  icon,
  title,
  text,
}) {
  return (
    <div className="feature-card">

      <div className="feature-icon">
        {icon}
      </div>

      <h3>
        {title}
      </h3>

      <p>
        {text}
      </p>

    </div>
  );
}


// =====================================================
// ANALYSIS RESULT
// =====================================================

function AnalysisResult({
  analysis,
  onReset,
}) {
  const rawScore =
    analysis?.match_score ??
    analysis?.match_percentage ??
    analysis?.matchPercentage ??
    analysis?.score ??
    analysis?.match ??
    0;

  const score = Math.min(
    100,
    Math.max(
      0,
      Number.parseFloat(rawScore) || 0
    )
  );

  const matchedSkills =
    getArray(
      analysis?.matched_keywords,
      analysis?.matched_skills,
      analysis?.skills_matched
    );

  const missingSkills =
    getArray(
      analysis?.missing_keywords,
      analysis?.missing_skills,
      analysis?.skills_missing
    );

  const summary =
    analysis?.summary ??
    analysis?.recommendation ??
    analysis?.message ??
    "";

  const status = getMatchStatus(score);

  const matchedCount =
    matchedSkills.length;

  const missingCount =
    missingSkills.length;

  const totalSkills =
    matchedCount + missingCount;

  const coverage =
    totalSkills > 0
      ? Math.round(
          (matchedCount / totalSkills) * 100
        )
      : Math.round(score);

  const circumference = 2 * Math.PI * 54;

  const offset =
    circumference -
    (score / 100) * circumference;

  return (
    <div
      id="analysis-result"
      className="result-container"
    >

      {/* =================================================
          RESULT HEADER
      ================================================= */}

      <div className="result-title">

        <div className="result-eyebrow">
          <span>✓</span>
          ANALYSIS COMPLETE
        </div>

        <h2>
          Your Resume Analysis
        </h2>

        <p>
          Here's how your resume compares with
          the provided job description.
        </p>

      </div>

      {/* =================================================
          MAIN SCORE
      ================================================= */}

      <div className="result-dashboard">

        <div className="score-section">

          <div className="score-ring">

            <svg
              viewBox="0 0 120 120"
            >

              <circle
                className="score-track"
                cx="60"
                cy="60"
                r="54"
              />

              <circle
                className="score-progress"
                cx="60"
                cy="60"
                r="54"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
              />

            </svg>

            <div className="score-value">

              <strong>
                {Math.round(score)}%
              </strong>

              <span>
                Match
              </span>

            </div>

          </div>

          <div className="score-description">

            <span className="status-badge">
              {status.label}
            </span>

            <h3>
              Resume compatibility
            </h3>

            <p>
              Your resume covers approximately{" "}
              <strong>
                {coverage}%
              </strong>{" "}
              of the detected job requirements.
            </p>

          </div>

        </div>

        {/* =================================================
            SCORE STATS
        ================================================= */}

        <div className="score-stats">

          <StatCard
            value={matchedCount}
            label="Matched Skills"
            type="success"
          />

          <StatCard
            value={missingCount}
            label="Missing Skills"
            type="warning"
          />

          <StatCard
            value={`${coverage}%`}
            label="Requirement Coverage"
            type="primary"
          />

        </div>

      </div>

      {/* =================================================
          SUMMARY
      ================================================= */}

      {summary && (
        <div className="insight-card">

          <div className="insight-icon">
            ✦
          </div>

          <div>

            <span className="insight-label">
              MATCH INSIGHT
            </span>

            <h3>
              What this result means
            </h3>

            <p>
              {typeof summary === "string"
                ? summary
                : JSON.stringify(summary)}
            </p>

          </div>

        </div>
      )}

      {/* =================================================
          SKILLS
      ================================================= */}

      <div className="skills-results">

        {/* MATCHED */}

        <div className="skills-box">

          <div className="skills-header">

            <div className="skills-title">

              <div className="skills-icon matched">
                ✓
              </div>

              <div>

                <h3>
                  Matched Skills
                </h3>

                <span>
                  Skills found in your resume
                </span>

              </div>

            </div>

            <strong className="skills-count matched-count">
              {matchedCount}
            </strong>

          </div>

          <div className="skill-list">

            {matchedSkills.length > 0 ? (
              matchedSkills.map(
                (skill, index) => (
                  <span
                    key={`matched-${index}`}
                    className="matched-skill"
                  >
                    <span>✓</span>
                    {getSkillName(skill)}
                  </span>
                )
              )
            ) : (
              <div className="empty-skills">
                No matched skills were detected.
              </div>
            )}

          </div>

        </div>

        {/* MISSING */}

        <div className="skills-box">

          <div className="skills-header">

            <div className="skills-title">

              <div className="skills-icon missing">
                !
              </div>

              <div>

                <h3>
                  Missing Skills
                </h3>

                <span>
                  Requirements not detected
                </span>

              </div>

            </div>

            <strong className="skills-count missing-count">
              {missingCount}
            </strong>

          </div>

          <div className="skill-list">

            {missingSkills.length > 0 ? (
              missingSkills.map(
                (skill, index) => (
                  <span
                    key={`missing-${index}`}
                    className="missing-skill"
                  >
                    <span>+</span>
                    {getSkillName(skill)}
                  </span>
                )
              )
            ) : (
              <div className="empty-skills success-empty">
                No missing skills were detected.
              </div>
            )}

          </div>

        </div>

      </div>

      {/* =================================================
          ACTION AREA
      ================================================= */}

      <div className="result-actions">

        <div>

          <strong>
            Want to analyze another application?
          </strong>

          <p>
            Upload another resume or target a different
            job description.
          </p>

        </div>

        <button
          className="secondary-btn"
          onClick={onReset}
        >
          Analyze Another Resume
        </button>

      </div>

    </div>
  );
}


// =====================================================
// STAT CARD
// =====================================================

function StatCard({
  value,
  label,
  type,
}) {
  return (
    <div
      className={`stat-card stat-${type}`}
    >

      <strong>
        {value}
      </strong>

      <span>
        {label}
      </span>

    </div>
  );
}


// =====================================================
// HELPERS
// =====================================================

function getArray(...values) {
  for (const value of values) {
    if (Array.isArray(value)) {
      return value;
    }
  }

  return [];
}


function getSkillName(skill) {
  if (typeof skill === "string") {
    return skill;
  }

  if (
    typeof skill === "object" &&
    skill !== null
  ) {
    return (
      skill.name ??
      skill.skill ??
      skill.keyword ??
      JSON.stringify(skill)
    );
  }

  return String(skill);
}


function getMatchStatus(score) {
  if (score >= 80) {
    return {
      label: "Strong Match",
    };
  }

  if (score >= 60) {
    return {
      label: "Good Match",
    };
  }

  if (score >= 40) {
    return {
      label: "Partial Match",
    };
  }

  return {
    label: "Needs Improvement",
  };
}


export default App;