import express from 'express';
import request from 'supertest';
import { createHealthRouter } from './healthRoute';
import { TunnelHealth } from '../tunnel/TunnelHealth';
import { TunnelStore } from '../tunnel/TunnelStore';

function buildApp() {
  const store = new TunnelStore();
  const tunnelHealth = new TunnelHealth(store);
  const app = express();
  app.use(express.json());
  app.use('/health', createHealthRouter(tunnelHealth));
  return { app, tunnelHealth };
}

describe('GET /health', () => {
  it('returns empty summary when no tunnels', async () => {
    const { app } = buildApp();
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ total: 0, healthy: 0, degraded: 0, down: 0, tunnels: [] });
  });

  it('returns correct counts for mixed statuses', async () => {
    const { app, tunnelHealth } = buildApp();
    tunnelHealth.recordSuccess('t1', 20);
    tunnelHealth.recordFailure('t2');
    tunnelHealth.recordFailure('t3');
    tunnelHealth.recordFailure('t3');
    tunnelHealth.recordFailure('t3');
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(3);
    expect(res.body.healthy).toBe(1);
    expect(res.body.degraded).toBe(1);
    expect(res.body.down).toBe(1);
  });
});

describe('GET /health/:id', () => {
  it('returns 404 for unknown tunnel', async () => {
    const { app } = buildApp();
    const res = await request(app).get('/health/unknown');
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/unknown/);
  });

  it('returns health record for known tunnel', async () => {
    const { app, tunnelHealth } = buildApp();
    tunnelHealth.recordSuccess('t1', 55);
    const res = await request(app).get('/health/t1');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe('t1');
    expect(res.body.status).toBe('healthy');
    expect(res.body.latencyMs).toBe(55);
  });

  it('returns degraded status after one failure', async () => {
    const { app, tunnelHealth } = buildApp();
    tunnelHealth.recordFailure('t2');
    const res = await request(app).get('/health/t2');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('degraded');
  });
});
