'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { WorkflowOrchestrator } = require('../automation/workflow-orchestrator');

const app = express();
const PORT = process.env.PORT || 3001;
const CLASSIFICATION_API_URL = process.env.CLASSIFICATION_API_URL || 'http://localhost:5001';

const orchestrator = new WorkflowOrchestrator();
const processedRequests = [];

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

app.use(cors());
app.use(express.json());

// ---------------------------------------------------------------------------
// POST /webhook — main ingestion endpoint
// ---------------------------------------------------------------------------

app.post('/webhook', async (req, res) => {
  try {
    const { text, source, ...rest } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Missing required field: text' });
    }

    // Classify the incoming text via the classification API.
    let classificationResponse;
    try {
      classificationResponse = await axios.post(`${CLASSIFICATION_API_URL}/classify`, { text });
    } catch (err) {
      return res.status(503).json({
        error: 'Classification service is unavailable',
        details: err.message,
      });
    }

    const { classification, confidence } = classificationResponse.data;

    // Route through the workflow orchestrator.
    const workflowResult = await orchestrator.route(classification, { text, source, ...rest });

    // Build and store the processing record.
    const record = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      text,
      source: source || 'unknown',
      classification,
      confidence,
      workflowResult,
      status: workflowResult.status,
    };

    processedRequests.push(record);

    return res.status(200).json(record);
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/stats — aggregated statistics
// ---------------------------------------------------------------------------

app.get('/api/stats', (req, res) => {
  const totalProcessed = processedRequests.length;

  const classificationBreakdown = {};
  let totalConfidence = 0;
  let successCount = 0;

  for (const record of processedRequests) {
    classificationBreakdown[record.classification] =
      (classificationBreakdown[record.classification] || 0) + 1;

    totalConfidence += record.confidence || 0;

    if (record.status === 'completed') {
      successCount++;
    }
  }

  const averageConfidence = totalProcessed === 0 ? 0 : totalConfidence / totalProcessed;
  const successRate = totalProcessed === 0 ? 0 : (successCount / totalProcessed) * 100;

  const recentActivity = processedRequests.slice(-10).reverse();

  return res.status(200).json({
    totalProcessed,
    classificationBreakdown,
    averageConfidence,
    successRate,
    recentActivity,
  });
});

// ---------------------------------------------------------------------------
// GET /api/logs — full processed-requests log with optional limit
// ---------------------------------------------------------------------------

app.get('/api/logs', (req, res) => {
  const limit = parseInt(req.query.limit, 10);

  if (limit && limit > 0) {
    return res.status(200).json(processedRequests.slice(-limit));
  }

  return res.status(200).json(processedRequests);
});

// ---------------------------------------------------------------------------
// GET /api/health — health check (pings classification API)
// ---------------------------------------------------------------------------

app.get('/api/health', async (req, res) => {
  let classificationServiceStatus = 'unavailable';

  try {
    await axios.get(`${CLASSIFICATION_API_URL}/health`, { timeout: 3000 });
    classificationServiceStatus = 'healthy';
  } catch {
    classificationServiceStatus = 'unavailable';
  }

  const status = classificationServiceStatus === 'healthy' ? 'healthy' : 'degraded';

  return res.status(200).json({
    status,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    services: {
      classificationAPI: classificationServiceStatus,
    },
  });
});

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------

app.listen(PORT, () => {
  console.log(`Automation engine running on port ${PORT}`);
  console.log(`Classification API: ${CLASSIFICATION_API_URL}`);
});

module.exports = app;
