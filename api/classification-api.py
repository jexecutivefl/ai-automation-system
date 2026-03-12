"""
Classification API Microservice

A Flask-based microservice that classifies text into predefined categories
using either a keyword-based mock classifier or OpenAI's ChatCompletion API.
"""

import os
import json
import logging
from datetime import datetime, timezone

from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Category keyword definitions
# ---------------------------------------------------------------------------

CATEGORY_KEYWORDS = {
    "support_ticket": [
        "help", "issue", "problem", "broken", "not working", "complaint", "refund",
    ],
    "sales_lead": [
        "interested", "pricing", "quote", "demo", "buy", "purchase", "plan",
    ],
    "billing": [
        "invoice", "payment", "charge", "subscription", "billing", "receipt",
    ],
    "technical_issue": [
        "error", "bug", "crash", "server", "api", "timeout", "500",
    ],
}

DEFAULT_CATEGORY = "general_inquiry"

SUPPORTED_CATEGORIES = list(CATEGORY_KEYWORDS.keys()) + [DEFAULT_CATEGORY]

# ---------------------------------------------------------------------------
# Classifier helpers
# ---------------------------------------------------------------------------


def _classifier_mode():
    """Return the active classifier mode: 'openai' if an API key is set, otherwise 'mock'."""
    return "openai" if os.getenv("OPENAI_API_KEY") else "mock"


def _mock_classify(text):
    """Classify *text* using simple keyword matching.

    Returns a tuple of (category, confidence).  Confidence is scaled between
    0.65 (single match / fallback) and 0.97 (many matches).
    """
    text_lower = text.lower()

    match_counts = {}
    for category, keywords in CATEGORY_KEYWORDS.items():
        count = sum(1 for kw in keywords if kw in text_lower)
        if count > 0:
            match_counts[category] = count

    if not match_counts:
        return DEFAULT_CATEGORY, 0.65

    best_category = max(match_counts, key=match_counts.get)
    best_count = match_counts[best_category]

    # Scale confidence: 1 match -> 0.65, each extra match adds 0.08, capped at 0.97
    confidence = min(0.65 + (best_count - 1) * 0.08, 0.97)

    return best_category, round(confidence, 2)


def _openai_classify(text):
    """Classify *text* using OpenAI's ChatCompletion API.

    Returns a tuple of (category, confidence).
    """
    import openai

    client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    system_prompt = (
        "You are a text classification assistant. Classify the user's message "
        "into exactly one of the following categories:\n"
        f"{', '.join(SUPPORTED_CATEGORIES)}\n\n"
        "Respond with valid JSON only, using this schema:\n"
        '{"classification": "<category>", "confidence": <float between 0 and 1>}\n'
        "Do not include any text outside the JSON object."
    )

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": text},
        ],
        temperature=0.0,
    )

    raw = response.choices[0].message.content.strip()
    result = json.loads(raw)

    classification = result.get("classification", DEFAULT_CATEGORY)
    if classification not in SUPPORTED_CATEGORIES:
        classification = DEFAULT_CATEGORY

    confidence = float(result.get("confidence", 0.85))
    confidence = round(max(0.0, min(1.0, confidence)), 2)

    return classification, confidence


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


@app.route("/classify", methods=["POST"])
def classify():
    """Classify the provided text and return the result.

    Expects JSON: ``{"text": "some message to classify"}``

    Returns JSON with classification, confidence, timestamp, and classifier mode.
    """
    data = request.get_json(silent=True)

    if not data or "text" not in data:
        return jsonify({"error": "Missing required field: text"}), 400

    text = data["text"]
    if not isinstance(text, str) or not text.strip():
        return jsonify({"error": "Field 'text' must be a non-empty string"}), 400

    try:
        mode = _classifier_mode()
        if mode == "openai":
            classification, confidence = _openai_classify(text)
        else:
            classification, confidence = _mock_classify(text)

        return jsonify({
            "classification": classification,
            "confidence": confidence,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "classifier": mode,
        })
    except Exception as exc:
        logger.exception("Classification failed")
        return jsonify({"error": f"Internal server error: {str(exc)}"}), 500


@app.route("/health", methods=["GET"])
def health():
    """Return service health status and active classifier mode."""
    return jsonify({
        "status": "healthy",
        "classifier": _classifier_mode(),
    })


@app.route("/categories", methods=["GET"])
def categories():
    """Return the list of supported classification categories."""
    return jsonify({
        "categories": SUPPORTED_CATEGORIES,
    })


# ---------------------------------------------------------------------------
# Entrypoint
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5001))
    logger.info("Starting Classification API on port %s (classifier=%s)", port, _classifier_mode())
    app.run(host="0.0.0.0", port=port, debug=False)
