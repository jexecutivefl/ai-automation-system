'use strict';

const request = require('supertest');
const axios = require('axios');

jest.mock('axios');

// Import the app (server won't start because of require.main guard)
const app = require('./automation-engine');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /webhook', () => {
  test('processes valid payload and returns record', async () => {
    axios.post.mockResolvedValue({
      data: { classification: 'billing', confidence: 0.85 },
    });

    const res = await request(app)
      .post('/webhook')
      .send({ text: 'I need a refund', source: 'email' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body.classification).toBe('billing');
    expect(res.body.confidence).toBe(0.85);
    expect(res.body.source).toBe('email');
    expect(res.body.status).toBe('completed');
    expect(res.body.workflowResult).toHaveProperty('handler');
  });

  test('returns 400 when text is missing', async () => {
    const res = await request(app)
      .post('/webhook')
      .send({ source: 'email' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('text');
  });

  test('returns 503 when classification service is down', async () => {
    axios.post.mockRejectedValue(new Error('ECONNREFUSED'));

    const res = await request(app)
      .post('/webhook')
      .send({ text: 'test', source: 'test' });

    expect(res.status).toBe(503);
    expect(res.body.error).toContain('Classification service');
  });

  test('defaults source to unknown when not provided', async () => {
    axios.post.mockResolvedValue({
      data: { classification: 'general_inquiry', confidence: 0.65 },
    });

    const res = await request(app)
      .post('/webhook')
      .send({ text: 'hello there' });

    expect(res.status).toBe(200);
    expect(res.body.source).toBe('unknown');
  });
});

describe('GET /api/stats', () => {
  test('returns stats structure', async () => {
    const res = await request(app).get('/api/stats');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('totalProcessed');
    expect(res.body).toHaveProperty('classificationBreakdown');
    expect(res.body).toHaveProperty('averageConfidence');
    expect(res.body).toHaveProperty('successRate');
    expect(res.body).toHaveProperty('recentActivity');
  });
});

describe('GET /api/logs', () => {
  test('returns array of logs', async () => {
    const res = await request(app).get('/api/logs');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('respects limit parameter', async () => {
    // First ensure we have data by sending a webhook
    axios.post.mockResolvedValue({
      data: { classification: 'billing', confidence: 0.85 },
    });
    await request(app).post('/webhook').send({ text: 'test log limit', source: 'test' });
    await request(app).post('/webhook').send({ text: 'test log limit 2', source: 'test' });

    const res = await request(app).get('/api/logs?limit=1');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeLessThanOrEqual(1);
  });
});

describe('GET /api/health', () => {
  test('returns healthy when classification API is up', async () => {
    axios.get.mockResolvedValue({ data: { status: 'healthy' } });

    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.services.classificationAPI).toBe('healthy');
    expect(res.body).toHaveProperty('uptime');
  });

  test('returns degraded when classification API is down', async () => {
    axios.get.mockRejectedValue(new Error('ECONNREFUSED'));

    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('degraded');
    expect(res.body.services.classificationAPI).toBe('unavailable');
  });
});
