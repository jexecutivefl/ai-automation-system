"""Tests for the Classification API microservice."""

import pytest
from importlib import import_module

# Import using the hyphenated filename
import importlib.util, sys, os

spec = importlib.util.spec_from_file_location(
    "classification_api",
    os.path.join(os.path.dirname(__file__), "classification-api.py"),
)
classification_api = importlib.util.module_from_spec(spec)
sys.modules["classification_api"] = classification_api
spec.loader.exec_module(classification_api)

app = classification_api.app
_mock_classify = classification_api._mock_classify
SUPPORTED_CATEGORIES = classification_api.SUPPORTED_CATEGORIES
DEFAULT_CATEGORY = classification_api.DEFAULT_CATEGORY


@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as c:
        yield c


# ---- /health ---------------------------------------------------------------

def test_health_returns_200(client):
    res = client.get("/health")
    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "healthy"
    assert data["classifier"] == "mock"


# ---- /categories -----------------------------------------------------------

def test_categories_returns_all(client):
    res = client.get("/categories")
    assert res.status_code == 200
    cats = res.get_json()["categories"]
    assert set(cats) == set(SUPPORTED_CATEGORIES)


# ---- /classify — success paths ---------------------------------------------

def test_classify_support_ticket(client):
    res = client.post("/classify", json={"text": "I need help with a problem"})
    assert res.status_code == 200
    data = res.get_json()
    assert data["classification"] == "support_ticket"
    assert 0 < data["confidence"] <= 1


def test_classify_sales_lead(client):
    res = client.post("/classify", json={"text": "I am interested in pricing for your plan"})
    assert res.status_code == 200
    data = res.get_json()
    assert data["classification"] == "sales_lead"


def test_classify_billing(client):
    res = client.post("/classify", json={"text": "I have a question about my invoice and payment"})
    assert res.status_code == 200
    data = res.get_json()
    assert data["classification"] == "billing"


def test_classify_technical_issue(client):
    res = client.post("/classify", json={"text": "There is a bug causing a server error 500"})
    assert res.status_code == 200
    data = res.get_json()
    assert data["classification"] == "technical_issue"


def test_classify_general_inquiry(client):
    res = client.post("/classify", json={"text": "Hello, what are your office hours?"})
    assert res.status_code == 200
    data = res.get_json()
    assert data["classification"] == DEFAULT_CATEGORY
    assert data["confidence"] == 0.65


def test_classify_response_has_timestamp_and_classifier(client):
    res = client.post("/classify", json={"text": "help"})
    data = res.get_json()
    assert "timestamp" in data
    assert data["classifier"] == "mock"


# ---- /classify — error paths -----------------------------------------------

def test_classify_missing_text_field(client):
    res = client.post("/classify", json={"message": "oops"})
    assert res.status_code == 400


def test_classify_empty_text(client):
    res = client.post("/classify", json={"text": ""})
    assert res.status_code == 400


def test_classify_whitespace_only_text(client):
    res = client.post("/classify", json={"text": "   "})
    assert res.status_code == 400


def test_classify_no_json_body(client):
    res = client.post("/classify", content_type="application/json", data="not json")
    assert res.status_code == 400


# ---- _mock_classify unit tests ---------------------------------------------

def test_mock_classify_confidence_scaling():
    """Multiple keyword matches should increase confidence."""
    # "help" + "problem" are both support_ticket keywords
    cat, conf = _mock_classify("I need help with a problem that is broken")
    assert cat == "support_ticket"
    assert conf > 0.65  # more than single-match baseline


def test_mock_classify_cap_at_097():
    """Confidence should never exceed 0.97."""
    # Many support keywords
    cat, conf = _mock_classify("help issue problem broken not working complaint refund")
    assert conf <= 0.97
