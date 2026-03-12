# AI Automation Workflow System - Technical Architecture

## System Overview

The AI Automation Workflow System is an end-to-end intelligent data processing pipeline that ingests unstructured text from multiple sources, classifies it using a machine-learning-powered engine, and routes it to the appropriate downstream system for action. The architecture follows a layered, loosely coupled design where each component communicates over well-defined REST APIs, enabling independent development, testing, and deployment of each service. This separation of concerns ensures that the classification model can be updated without affecting the automation engine and that new downstream integrations can be added with minimal changes to existing code.

## Architecture Diagram

```
                Incoming Data
                     |
                     v
               API Gateway
                     |
                     v
            Data Processing Layer
                     |
                     v
            AI Classification Engine
                     |
                     v
             Workflow Orchestrator
               /      |      \
              v       v       v
         CRM System  Ticketing  Database
```

## Component Descriptions

### API Gateway (Express.js - Port 3001)

The API Gateway serves as the single entry point for all external requests. Built on Express.js, it listens on port 3001 and handles webhook ingestion, request validation, and routing. It exposes REST endpoints for submitting text payloads, querying processing statistics, and retrieving activity logs. The gateway forwards classification requests to the AI Classification Engine and manages the orchestration lifecycle for each incoming item.

### AI Classification Engine (Flask - Port 5001)

The AI Classification Engine is a Python-based microservice built with Flask, running on port 5001. It accepts raw text input and returns a structured classification result including the predicted category, confidence score, and recommended action. The engine uses keyword-based heuristic matching to categorize incoming text into predefined categories such as support, sales, billing, and technical issues. It also exposes health-check and category-listing endpoints for operational monitoring.

### Workflow Orchestrator (Node.js Module)

The Workflow Orchestrator is an internal Node.js module embedded within the automation engine. It receives classification results and determines the appropriate downstream action based on category and confidence thresholds. The orchestrator routes items to CRM systems for sales leads, ticketing platforms for support requests, and the internal database for logging and audit purposes. It applies configurable business rules to decide how each classified item should be handled.

### Monitoring Dashboard (React/Vite - Port 5173)

The Monitoring Dashboard is a single-page application built with React and served via Vite's development server on port 5173. It provides real-time visibility into system activity, displaying classification statistics, processing logs, and category distribution charts. The dashboard polls the automation engine's API endpoints to keep its views current and uses Recharts for data visualization.

## API Contract

### Classification API (Port 5001)

| Service              | Endpoint      | Method | Request Body                          | Response Body                                                                                         |
|----------------------|---------------|--------|---------------------------------------|-------------------------------------------------------------------------------------------------------|
| Classification API   | `/classify`   | POST   | `{ "text": "string" }`               | `{ "category": "string", "confidence": number, "action": "string", "timestamp": "string" }`          |
| Classification API   | `/health`     | GET    | N/A                                   | `{ "status": "healthy", "service": "ai-classifier", "timestamp": "string" }`                         |
| Classification API   | `/categories` | GET    | N/A                                   | `{ "categories": ["support", "sales", "billing", "technical", "general"] }`                           |

### Automation Engine (Port 3001)

| Service              | Endpoint       | Method | Request Body                                      | Response Body                                                                                    |
|----------------------|----------------|--------|---------------------------------------------------|--------------------------------------------------------------------------------------------------|
| Automation Engine    | `/webhook`     | POST   | `{ "text": "string", "source": "string" }`       | `{ "status": "processed", "id": "string", "classification": {...}, "action_taken": "string" }`  |
| Automation Engine    | `/api/stats`   | GET    | N/A                                               | `{ "total_processed": number, "categories": {...}, "avg_confidence": number }`                   |
| Automation Engine    | `/api/logs`    | GET    | N/A                                               | `{ "logs": [{ "id": "string", "text": "string", "category": "string", "timestamp": "string" }] }` |
| Automation Engine    | `/api/health`  | GET    | N/A                                               | `{ "status": "healthy", "service": "automation-engine", "uptime": number }`                      |

## Data Flow

1. **Ingestion** - External data arrives at the API Gateway via the `/webhook` endpoint as a JSON payload containing raw text and its source identifier.
2. **Validation** - The API Gateway validates the incoming request structure, ensures required fields are present, and assigns a unique processing ID to the item.
3. **Classification** - The validated text is forwarded to the AI Classification Engine at `http://localhost:5001/classify`, which analyzes the content and returns a category, confidence score, and recommended action.
4. **Orchestration** - The Workflow Orchestrator receives the classification result and evaluates it against configured business rules to determine the appropriate downstream destination.
5. **Routing** - Based on the classification category, the orchestrator routes the item to the corresponding system: CRM for sales leads, ticketing platform for support requests, or direct database storage for general items.
6. **Logging** - Every processed item, along with its classification result and routing decision, is recorded in the internal log store and reflected in the aggregated statistics accessible through the dashboard.

## Technology Choices

| Technology | Role                    | Justification                                                                                                    |
|------------|-------------------------|------------------------------------------------------------------------------------------------------------------|
| Flask      | Classification Service  | Lightweight Python framework well-suited for ML/NLP microservices; minimal boilerplate allows focus on model logic. |
| Express.js | API Gateway / Engine    | Fast, unopinionated Node.js framework ideal for building REST APIs and webhook handlers with extensive middleware support. |
| React      | Dashboard UI            | Component-based architecture enables modular, maintainable UI development with a rich ecosystem of supporting libraries. |
| Recharts   | Data Visualization      | Composable charting library built on React components; integrates naturally with the dashboard's component model.  |
| Vite       | Frontend Build Tool     | Provides near-instant hot module replacement during development and optimized production builds with minimal configuration. |

## Local Deployment Notes

The system requires three terminals to run all services concurrently during local development:

**Terminal 1 - AI Classification Engine (Port 5001)**
```bash
cd ai-classifier
pip install -r requirements.txt
python app.py
```

**Terminal 2 - Automation Engine / API Gateway (Port 3001)**
```bash
cd automation-engine
npm install
node server.js
```

**Terminal 3 - Monitoring Dashboard (Port 5173)**
```bash
cd dashboard
npm install
npm run dev
```

Once all three services are running, the system is fully operational. The classification engine must be started first, as the automation engine depends on it for processing incoming webhooks. The dashboard can be started at any time and will begin displaying data as soon as it connects to the automation engine API.
