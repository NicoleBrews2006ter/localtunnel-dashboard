import express from 'express';
import request from 'supertest';
import { createGroupsRouter } from './groupsRoute';
import { clearGroupStore, createTunnelGroup } from '../tunnel/TunnelGroup';

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/groups', createGroupsRouter());
  return app;
}

beforeEach(() => clearGroupStore());

describe('GET /groups', () => {
  it('returns empty array when no groups exist', async () => {
    const res = await request(buildApp()).get('/groups');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns all groups', async () => {
    createTunnelGroup('prod');
    createTunnelGroup('staging');
    const res = await request(buildApp()).get('/groups');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
  });
});

describe('POST /groups', () => {
  it('creates a new group', async () => {
    const res = await request(buildApp()).post('/groups').send({ name: 'dev', color: '#abc' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('dev');
    expect(res.body.color).toBe('#abc');
  });

  it('returns 400 when name is missing', async () => {
    const res = await request(buildApp()).post('/groups').send({});
    expect(res.status).toBe(400);
  });
});

describe('GET /groups/:groupId', () => {
  it('returns the group', async () => {
    const g = createTunnelGroup('test');
    const res = await request(buildApp()).get(`/groups/${g.id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(g.id);
  });

  it('returns 404 for unknown group', async () => {
    const res = await request(buildApp()).get('/groups/ghost');
    expect(res.status).toBe(404);
  });
});

describe('POST /groups/:groupId/tunnels', () => {
  it('adds a tunnel to the group', async () => {
    const g = createTunnelGroup('test');
    const res = await request(buildApp())
      .post(`/groups/${g.id}/tunnels`)
      .send({ tunnelId: 'tunnel-1' });
    expect(res.status).toBe(200);
    expect(res.body.tunnelIds).toContain('tunnel-1');
  });

  it('returns 404 for unknown group', async () => {
    const res = await request(buildApp()).post('/groups/ghost/tunnels').send({ tunnelId: 't1' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /groups/:groupId/tunnels/:tunnelId', () => {
  it('removes a tunnel from the group', async () => {
    const g = createTunnelGroup('test', { tunnelIds: ['t1', 't2'] });
    const res = await request(buildApp()).delete(`/groups/${g.id}/tunnels/t1`);
    expect(res.status).toBe(200);
    expect(res.body.tunnelIds).not.toContain('t1');
  });
});

describe('DELETE /groups/:groupId', () => {
  it('deletes the group', async () => {
    const g = createTunnelGroup('temp');
    const res = await request(buildApp()).delete(`/groups/${g.id}`);
    expect(res.status).toBe(204);
  });

  it('returns 404 for unknown group', async () => {
    const res = await request(buildApp()).delete('/groups/ghost');
    expect(res.status).toBe(404);
  });
});
