import request from 'supertest';
import express from 'express';
import { createStatusRouter } from './statusRoute';
import { TunnelStore } from '../tunnel/TunnelStore';

function buildApp(store: TunnelStore) {
  const app = express();
  app.use(express.json());
  app.use('/api/status', createStatusRouter(store));
  return app;
}

describe('GET /api/status', () => {
  let store: TunnelStore;

  beforeEach(() => {
    store = new TunnelStore();
  });

  it('returns ok with zero tunnels', async () => {
    const res = await request(buildApp(store)).get('/api/status');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.tunnels).toEqual({ total: 0, online: 0, offline: 0, errored: 0 });
    expect(typeof res.body.uptime).toBe('number');
  });

  it('counts tunnels by status correctly', async () => {
    store.add({ id: 't1', url: 'https://t1.loca.lt', status: 'online', createdAt: new Date().toISOString() });
    store.add({ id: 't2', url: 'https://t2.loca.lt', status: 'offline', createdAt: new Date().toISOString() });
    store.add({ id: 't3', url: 'https://t3.loca.lt', status: 'error', createdAt: new Date().toISOString() });
    store.add({ id: 't4', url: 'https://t4.loca.lt', status: 'online', createdAt: new Date().toISOString() });

    const res = await request(buildApp(store)).get('/api/status');
    expect(res.status).toBe(200);
    expect(res.body.tunnels).toEqual({ total: 4, online: 2, offline: 1, errored: 1 });
  });
});

describe('GET /api/status/:id', () => {
  let store: TunnelStore;

  beforeEach(() => {
    store = new TunnelStore();
    store.add({ id: 'abc', url: 'https://abc.loca.lt', status: 'online', createdAt: new Date().toISOString() });
  });

  it('returns tunnel info for a known id', async () => {
    const res = await request(buildApp(store)).get('/api/status/abc');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.tunnel.id).toBe('abc');
    expect(res.body.tunnel.status).toBe('online');
  });

  it('returns 404 for an unknown id', async () => {
    const res = await request(buildApp(store)).get('/api/status/unknown');
    expect(res.status).toBe(404);
    expect(res.body.ok).toBe(false);
  });
});
