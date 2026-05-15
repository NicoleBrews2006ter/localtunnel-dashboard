import express, { Express } from 'express';
import request from 'supertest';
import { createPriorityRouter } from './priorityRoute';

function buildApp(): Express {
  const app = express();
  app.use(express.json());
  app.use('/priority', createPriorityRouter());
  return app;
}

describe('GET /priority', () => {
  it('returns an array', async () => {
    const res = await request(buildApp()).get('/priority');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('PUT /priority/:tunnelId', () => {
  it('sets a valid priority', async () => {
    const app = buildApp();
    const res = await request(app)
      .put('/priority/tunnel-1')
      .send({ level: 'high' });
    expect(res.status).toBe(200);
    expect(res.body.level).toBe('high');
    expect(res.body.tunnelId).toBe('tunnel-1');
  });

  it('rejects invalid level', async () => {
    const res = await request(buildApp())
      .put('/priority/tunnel-1')
      .send({ level: 'extreme' });
    expect(res.status).toBe(400);
  });

  it('rejects missing level', async () => {
    const res = await request(buildApp())
      .put('/priority/tunnel-1')
      .send({});
    expect(res.status).toBe(400);
  });
});

describe('GET /priority/:tunnelId', () => {
  it('returns 404 for unknown tunnel', async () => {
    const res = await request(buildApp()).get('/priority/no-such-tunnel');
    expect(res.status).toBe(404);
  });

  it('returns entry after setting', async () => {
    const app = buildApp();
    await request(app).put('/priority/t42').send({ level: 'critical' });
    const res = await request(app).get('/priority/t42');
    expect(res.status).toBe(200);
    expect(res.body.level).toBe('critical');
  });
});

describe('DELETE /priority/:tunnelId', () => {
  it('deletes an existing entry', async () => {
    const app = buildApp();
    await request(app).put('/priority/t-del').send({ level: 'low' });
    const res = await request(app).delete('/priority/t-del');
    expect(res.status).toBe(204);
  });

  it('returns 404 when not found', async () => {
    const res = await request(buildApp()).delete('/priority/ghost');
    expect(res.status).toBe(404);
  });
});

describe('GET /priority/sorted', () => {
  it('returns sorted ids', async () => {
    const app = buildApp();
    await request(app).put('/priority/a').send({ level: 'low' });
    await request(app).put('/priority/b').send({ level: 'critical' });
    const res = await request(app).get('/priority/sorted?ids=a,b');
    expect(res.status).toBe(200);
    expect(res.body[0]).toBe('b');
  });

  it('returns 400 when ids missing', async () => {
    const res = await request(buildApp()).get('/priority/sorted');
    expect(res.status).toBe(400);
  });
});
