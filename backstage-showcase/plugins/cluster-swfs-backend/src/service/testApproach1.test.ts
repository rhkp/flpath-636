import { getVoidLogger, loadBackendConfig } from '@backstage/backend-common';
import express from 'express';
import request from 'supertest';
import { expect, jest } from '@jest/globals';
import { createRouter } from './router';
import { LoggerService } from '@backstage/backend-plugin-api';

import { ClusterSWFBackend } from './clusterSWFBackend';

describe('createRouter', () => {
  let app: express.Express;

  beforeAll(async () => {
    const logger: LoggerService = {
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
      child: jest.fn(),
    };

    const config = await loadBackendConfig({ logger, argv: [] });
    console.log(config ? 'Config found' : 'Config not found');
    const router = await createRouter({
      logger: getVoidLogger(),
      config: config,
    });
    app = express().use(router);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /health', () => {
    it('returns ok', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toEqual(200);
    });
  });

  describe('GET /swfs', () => {
    it('returns ok', async () => {
      const mock = jest
        .spyOn(ClusterSWFBackend, 'getSWFs')
        .mockImplementation(() => {
          const result = `
             [
                {
                  "id": "mock-event-timeout1",
                  "name": "moc-workflow",
                  "version": "0.0.1",
                  "type": null,
                  "endpoint": "http://172.30.206.161:80/event-timeout",
                  "serviceUrl": "http://172.30.206.161:80",
                  "__typename": "ProcessDefinition"
                }
             ] 
            `;
          return JSON.parse(result);
        });

      const response = await request(app).get('/swfs');
      expect(mock).toHaveBeenCalled();
      expect(response.status).toEqual(200);
      expect(response.body.message).toEqual('success');
      console.log(response.body);
    });
  });
});
