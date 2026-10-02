# Architecture Audit & Intelligence Roadmap: Resume Intelligence Engine

**Date:** 2026-09-20  
**Repository:** `resume-intelligence-engine`  
**Audit Type:** Universal Multi-Format Evidence-Based Assessment & Production Roadmap  

---

## 1. Executive Summary

The `resume-intelligence-engine` is designed to compare resumes against job descriptions and provide transparent, actionable analysis. The initial prototype established basic file uploading and a single-page React dashboard. However, its core intelligence relied on naive word tokenization and set intersection, leading to significant accuracy issues: common English filler words were counted as technical skills, complex requirements could not be decomposed, formatting and column structures in PDFs were lost, and scores lacked evidence and traceability.

This updated audit establishes the architectural foundations for transforming the engine into a **universal, evidence-based intelligence platform** that works accurately across **any resume** and **any job description**, adhering strictly to the **No-Hallucination Principle**: *no skill or experience may ever be attributed to a candidate without verifiable verbatim evidence from their resume.*

---

## 2. Current Architecture & Data Flow

### 2.1 Repository Structure
```
resume-intelligence-engine/
├── .dockerignore
├── .gitignore
├── README.md
├── docker-compose.yml
├── backend/
│   ├── .env.example
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── __init__.py
│       ├── main.py
│       ├── api/
│       │   ├── __init__.py
│       │   ├── health.py
│       │   ├── upload.py
│       │   └── analyze.py
│       ├── models/
│       │   ├── __init__.py
│       │   └── schemas.py
│       ├── parsers/
│       │   ├── __init__.py
│       │   ├── pdf_parser.py
│       │   └── docx_parser.py
│       └── services/
│           ├── __init__.py
│           └── matcher.py
└── frontend/
    ├── Dockerfile
    ├── index.html
    ├── package.json
    ├── package-lock.json
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── styles.css
        ├── components/
        │   ├── UploadForm.jsx
        │   └── ResultCard.jsx
        ├── pages/
        │   └── Home.jsx
        └── services/
            └── api.js
```

### 2.2 Existing Backend Functionality
- **`app/main.py`:** Configured with CORS for local dev. Integrates `/api/health`, `/api/upload`, and `/api/analyze`.
- **`app/api/upload.py`:** Accepts `.pdf` and `.docx`, extracts raw text and returns word count.
- **`app/api/analyze.py`:** Accepts multipart form or JSON payloads, calls `analyze_match()`, and returns match score, matched skills, missing skills, and summary.
- **`app/parsers/pdf_parser.py`:** Basic `pypdf` page text iteration; lacks column sorting, block bounding box analysis, or layout awareness.
- **`app/parsers/docx_parser.py`:** Recursive paragraph and table cell text aggregation; lacks heading hierarchy and style semantics.
- **`app/services/matcher.py`:** Naive regex `[a-zA-Z][a-zA-Z0-9+#.]{1,}` lowercased, filtered against a small 27-word stopword set. Calculates `(len(matched) / len(job_keywords_unique)) * 100`.

---

## 3. Analysis of Deficiencies & Accuracy Problems

### 3.1 Naive Token Matching & False Positives / False Negatives
- **Punctuation & Tokenization Artifacts:** Trailing periods or punctuation (e.g. `kubernetes.`) become distinct tokens.
- **Grammatical Words as Skills:** Words like `"seeking"`, `"developer"`, `"candidate"`, `"knowledge"`, `"plus"`, `"requirements"` are treated as mandatory skills if they appear in the JD.
- **No Synonym / Alias Awareness:** `"React.js"` or `"ReactJS"` fails to match `"React"`; `"PostgreSQL"` fails to match `"Postgres"`.
- **No Separation of Importance:** Nice-to-have or bonus qualifications are weighted identically to mandatory requirements.
- **Single Keyword vs. Real Responsibility:** A candidate mentioning "Python" in a single hobby line receives full credit even if the JD requires "5+ years architecting high-throughput distributed Python backends".

### 3.2 Parsing Limitations Across Universal Resumes
- **Multi-Column Resumes:** Standard linear PDF text extraction reads horizontally across two columns, interleaving sentences (e.g. left column job title mixed with right column education details).
- **Section Detection:** Lack of flexible section recognition (e.g. "Work History", "Career Experience", "Relevant Projects", "Academic Background") prevents contextual scoping of skills.
- **Lost Evidence Traceability:** Currently, all extracted text is flattened into one unstructured string, discarding page numbers, section origins, and sentence boundaries.

### 3.3 Lack of Explainability & Verification
- The current score (0–100%) provides no insight into how it was computed.
- Candidates cannot see *where* in their resume a match was found or *why* a particular skill was marked missing.
- There is no evidence matrix connecting JD requirements to verbatim resume excerpts.

---

## 4. Universal Intelligence Architecture

To achieve high accuracy across any resume and any job description without hardcoding, the system is structured into seven decoupled, deterministic-first layers:

```
┌────────────────────────────────────────────────────────┐
│                   Untrusted Input                      │
│      Resume File (PDF/DOCX)  +  Job Description Text    │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│  Layer 1: Security & File Integrity                    │
│  - Magic byte verification (%PDF-, PK\x03\x04)         │
│  - 10MB size limit check                               │
│  - Filename sanitization                               │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│  Layer 2: Universal Layout-Aware Document Parsing      │
│  - PyMuPDF block layout sorting (reading order)        │
│  - Multi-column & table spatial awareness              │
│  - Verbatim text extraction preserving line breaks     │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│  Layer 3: Structural Section & Entity Extraction       │
│  - Fuzzy section detection (Experience, Edu, Skills)  │
│  - Bullet point & sentence tokenization                │
│  - Provenance tracking (Section, Bullet, Snippet)      │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│  Layer 4: Universal Job Description Intelligence       │
│  - Atomic requirement decomposition                    │
│  - Importance classification: Required/Preferred/Unsp. │
│  - Technical & domain entity identification            │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│  Layer 5: Multi-Layer Evidence-Based Matching Engine   │
│  - Layer 5a: Exact phrase matching                     │
│  - Layer 5b: Normalized alias & taxonomy matching      │
│  - Layer 5c: Context-aware responsibility matching     │
│  - Strict Anti-Hallucination: No evidence = Missing    │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│  Layer 6: Transparent ATS Scoring & Evidence Matrix    │
│  - Configurable weights (Required, Preferred, Exp, Edu)│
│  - Detailed sub-score breakdowns with formulas         │
│  - Evidence Matrix: Requirement ↔ Verbatim Quote       │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│  Layer 7: Actionable, Evidence-Grounded Insights       │
│  - High/Medium/Low prioritized recommendations         │
│  - Concrete problems with resume evidence snippets     │
│  - Clear advice: never fabricate unearned skills       │
└────────────────────────────────────────────────────────┘
```

---

## 5. Strict Anti-Hallucination Framework

The system enforces the following non-negotiable rules:
1. **Verbatim Evidence Requirement:** Every claim that a candidate possesses a skill must be backed by an exact quote (`resume_evidence`) and its source section.
2. **Standardized Match Typologies:**
   - **Explicit Match:** Exact or normalized term found directly in resume text with evidence.
   - **Normalized Match:** Direct alias or canonical equivalent identified (e.g., `PostgreSQL` matches `Postgres`).
   - **Strong Semantic Match:** Candidate's experience or project bullet demonstrates the required capability with documented context.
   - **Partial Match:** Related knowledge or academic/personal exposure without full professional context.
   - **Missing / No Evidence:** Zero verifiable evidence exists in the document.
3. **No Automatic Extrapolation:** Mentioning "Python" will never infer "Django" or "Data Science". Mentioning "React" will never infer "Next.js" or "Redux".
4. **Transparent Uncertainty:** When context is ambiguous, mark confidence as Moderate or Low, and note the ambiguity in the explanation.

---

## 6. Implementation & Migration Plan

The modernization will proceed in focused, backward-compatible phases:

1. **Core & Configuration:** Introduce centralized settings, scoring weights, and security checks.
2. **Universal Document Parsers:** Upgrade PDF parsing to PyMuPDF layout-aware block extraction and DOCX structured parsing.
3. **Section & Entity Intelligence:** Add universal section identification and sentence/bullet extraction with provenance.
4. **JD Requirement Decomposition:** Implement atomic requirement parser with linguistic importance classification (Required vs Preferred vs Unspecified).
5. **Taxonomy & Normalization:** Build bidirectional technical alias dictionary and taxonomy.
6. **Evidence Matrix & Multi-Signal Matcher:** Implement multi-signal comparison producing the Requirement-to-Evidence mapping.
7. **Transparent ATS Engine:** Compute weighted, explainable sub-scores.
8. **Actionable Recommendations:** Generate prioritized suggestions based on verified gaps.
9. **API & Backward-Compatibility:** Update `/api/analyze` to return rich results while maintaining legacy fields (`match_score`, `matched_skills`, `missing_skills`, `summary`).
10. **Frontend Visualization:** Update the UI to render the ATS Breakdown, Evidence Matrix, and Prioritized Recommendations.
11. **Accuracy & Anti-Hallucination Test Suite:** Implement extensive Pytest unit tests validating parsing, scoring, and zero-hallucination guarantees.
