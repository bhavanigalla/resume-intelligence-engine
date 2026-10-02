from app.services.matcher import analyze_match


def test_exact_skill_match():
    resume = """
    Python developer with experience in AWS, React, SQL, and Docker.
    """

    job_description = """
    Looking for a developer with Python, AWS, React, SQL, and Docker.
    """

    score, matched, missing = analyze_match(
        resume,
        job_description,
    )

    assert score == 100.0
    assert "python" in matched
    assert "aws" in matched
    assert "react" in matched
    assert "sql" in matched
    assert "docker" in matched
    assert missing == []


def test_synonym_matching():
    resume = """
    Experienced Python3 developer working with Amazon Web Services
    and ReactJS.
    """

    job_description = """
    Required skills: Python, AWS, and React.
    """

    score, matched, missing = analyze_match(
        resume,
        job_description,
    )

    assert score == 100.0
    assert "python" in matched
    assert "aws" in matched
    assert "react" in matched
    assert missing == []


def test_missing_skill_is_detected():
    resume = """
    Python developer with experience in SQL.
    """

    job_description = """
    Looking for Python, SQL, AWS, and Docker experience.
    """

    score, matched, missing = analyze_match(
        resume,
        job_description,
    )

    assert "python" in matched
    assert "sql" in matched
    assert "aws" in missing
    assert "docker" in missing
    assert score < 100.0


def test_empty_resume():
    score, matched, missing = analyze_match(
        "",
        "Python developer with AWS experience.",
    )

    assert score == 0.0
    assert matched == []
    assert missing


def test_empty_job_description():
    score, matched, missing = analyze_match(
        "Python developer with AWS experience.",
        "",
    )

    assert score == 0.0
    assert matched == []
    assert missing == []


def test_generic_words_do_not_dominate_score():
    resume = """
    Experienced developer who can work with a strong team.
    """

    job_description = """
    Experienced developer with Python and AWS skills.
    """

    score, matched, missing = analyze_match(
        resume,
        job_description,
    )

    assert "python" in missing
    assert "aws" in missing
    assert score < 100.0


def test_multi_word_skill_matching():
    resume = """
    Built machine learning models using Python and scikit learn.
    """

    job_description = """
    Experience with machine learning, Python, and scikit learn.
    """

    score, matched, missing = analyze_match(
        resume,
        job_description,
    )

    assert "machine learning" in matched
    assert "python" in matched
    assert "scikit learn" in matched
    assert missing == []


def test_score_is_between_zero_and_hundred():
    resume = """
    Python, SQL, AWS, Docker, React.
    """

    job_description = """
    Python, SQL, AWS, Docker, React, Kubernetes.
    """

    score, matched, missing = analyze_match(
        resume,
        job_description,
    )

    assert 0.0 <= score <= 100.0