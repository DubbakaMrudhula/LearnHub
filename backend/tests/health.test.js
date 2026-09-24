import request from 'supertest';
import app from '../src/app.js';

describe('Health Check API', () => {
  it('GET /api/health should return status 200 and operational health data', async () => {
    const res = await request(app).get('/api/health');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('service', 'LearnHub API Server');
    expect(res.body.data).toHaveProperty('status', 'healthy');
    expect(res.body.data).toHaveProperty('environment');
    expect(res.body.data).toHaveProperty('database');
  });

  it('GET /api should return API documentation and overview', async () => {
    const res = await request(app).get('/api');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('version', '1.0.0');
  });

  it('GET /api/non-existent-route should return standardized 404 error', async () => {
    const res = await request(app).get('/api/non-existent-route');

    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('error', 'NOT_FOUND');
  });
});
