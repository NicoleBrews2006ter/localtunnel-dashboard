import express, { Express } from 'express';
import request from 'supertest';
import { createTunnelsRouter } from './tunnelsRoute';
import { TunnelStore } from '../tunnel/TunnelStore';
import { TunnelManager } from '../tunnel/TunnelManager';

const mockTunnel = { id: 'abc123', url: 'https://abc123.loca.lt', port: 3000, status: 'open' as const };

function buildApp(): Express {
  const store = new TunnelStore();
  const manager = {
    open: jest.fn().mockResolvedValue(mockTunnel),
    close: jest.fn().mockResolvedValue(undefined),
  } as unknown as TunnelManager;

  store.set(mockTunnel.id, mockTunnel as any);

  const app = express();
  app.use(express.json());
  app.use('/tunnels', createTunnelsRouter(store, manager));
  return app;
}

describe('GET /tunnels', () => {
  it('returns all tunnels', async () => {
    const res = await request(buildApp()).get('/tunnels');
    expect(res.status).toBe(200);
    expect(res.body.tunnels).toHaveLength(1);
  });
});

describe('GET /tunnels/:id', () => {
  it('returns a specific tunnel', async () => {
    const res = await request(buildApp()).get('/tunnels/abc123');
    expect(res.status).toBe(200);
    expect(res.body.tunnel.id).toBe('abc123');
  });

  it('returns 404 for unknown tunnel', async () => {
    const res = await request(buildApp()).get('/tunnels/unknown');
    expect(res.status).toBe(404);
  });
});

describe('POST /tunnels', () => {
  it('creates a new tunnel', async () => {
    const res = await request(buildApp())
      .post('/tunnels')
      .send({ port: 3000, subdomain: 'myapp' });
    expect(res.status).toBe(201);
    expect(res.body.tunnel.url).toContain('loca.lt');
  });

  it('returns 400 when port is missing', async () => {
    const res = await request(buildApp()).post('/tunnels').send({});
    expect(res.status).toBe(400);
  });
});

describe('DELETE /tunnels/:id', () => {
  it('closes and removes a tunnel', async () => {
    const res = await request(buildApp()).delete('/tunnels/abc123');
    expect(res.status).toBe(204);
  });

  it('returns 404 for unknown tunnel', async () => {
    const res = await request(buildApp()).delete('/tunnels/ghost');
    expect(res.status).toBe(404);
  });
});
