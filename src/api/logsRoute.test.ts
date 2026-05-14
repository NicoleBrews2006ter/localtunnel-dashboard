import express, { Express } from 'express';
import request from 'supertest';
import { TunnelLogger } from '../tunnel/TunnelLogger';
import { createLogsRouter } from './logsRoute';

function buildApp(logger: TunnelLogger): Express {
  const app = express();
  app.use(express.json());
  app.use('/logs', createLogsRouter(logger));
  return app;
}

describe('GET /logs', () => {
  it('should return all logs', async () => {
    const logger = new TunnelLogger();
    logger.log('t1', 'info', 'Hello');
    logger.log('t2', 'warn', 'Warning');
    const app = buildApp(logger);
    const res = await request(app).get('/logs');
    expect(res.status).toBe(200);
    expect(res.body.logs).toHaveLength(2);
  });

  it('should return empty logs when none exist', async () => {
    const logger = new TunnelLogger();
    const app = buildApp(logger);
    const res = await request(app).get('/logs');
    expect(res.status).toBe(200);
    expect(res.body.logs).toEqual([]);
  });
});

describe('GET /logs/:tunnelId', () => {
  it('should return logs for a specific tunnel', async () => {
    const logger = new TunnelLogger();
    logger.log('t1', 'info', 'Tunnel up');
    logger.log('t2', 'error', 'Tunnel down');
    const app = buildApp(logger);
    const res = await request(app).get('/logs/t1');
    expect(res.status).toBe(200);
    expect(res.body.tunnelId).toBe('t1');
    expect(res.body.logs).toHaveLength(1);
    expect(res.body.logs[0].message).toBe('Tunnel up');
  });

  it('should return empty logs for unknown tunnel', async () => {
    const logger = new TunnelLogger();
    const app = buildApp(logger);
    const res = await request(app).get('/logs/unknown');
    expect(res.status).toBe(200);
    expect(res.body.logs).toEqual([]);
  });
});

describe('DELETE /logs/:tunnelId', () => {
  it('should clear logs for a tunnel', async () => {
    const logger = new TunnelLogger();
    logger.log('t1', 'info', 'Some log');
    const app = buildApp(logger);
    const res = await request(app).delete('/logs/t1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(logger.getLogsForTunnel('t1')).toEqual([]);
  });
});
