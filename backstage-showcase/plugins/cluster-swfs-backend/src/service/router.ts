import { errorHandler } from '@backstage/backend-common';
import express from 'express';
import Router from 'express-promise-router';
import { Logger } from 'winston';
import { ClusterSWFBackend } from './clusterSWFBackend';
import { Swf } from '../types/swf';
import { ErrorBuilder, NO_DATA_INDEX_URL } from '../helpers/errorBuilder';
import { ApiResponseBuilder } from '../types/apiResponse';
import { BackendExecCtx } from '../types/backendExecCtx';
import { Config } from '@backstage/config';
import { DEFAULT_DATA_INDEX_URL } from '../types/constants';

export interface RouterOptions {
  logger: Logger;
  config: Config;
}

export async function getSwfs(
  dataIndexUrl: string,
  logger: any,
): Promise<Swf[]> {
  if (!dataIndexUrl || dataIndexUrl.length === 0) {
    throw ErrorBuilder.GET_NO_DATA_INDEX_URL_ERR();
  }
  const client = ClusterSWFBackend.getNewGraphQLClient(dataIndexUrl);
  const backendExecCtx = new BackendExecCtx(logger, client, dataIndexUrl);

  ClusterSWFBackend.initialize(backendExecCtx);
  return await ClusterSWFBackend.getSWFs();
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config } = options;

  const router = Router();
  router.use(express.json());

  router.get('/health', (_, response) => {
    logger.info('GET /health called');
    response.json(ApiResponseBuilder.SUCCESS_RESPONSE('ok'));
  });

  router.get('/swfs', async (_, response) => {
    logger.info('GET /swfs called');
    let dataIndexUrl = '';
    try {
      if (config) {
        dataIndexUrl =
          config.getOptionalString('plugin-cluster-swfs-backend.url') ||
          DEFAULT_DATA_INDEX_URL;
      }

      if (dataIndexUrl.trim().length === 0) {
        throw ErrorBuilder.GET_NO_DATA_INDEX_URL_ERR();
      }

      const swfs = await getSwfs(dataIndexUrl, options.logger);

      response.json(ApiResponseBuilder.SUCCESS_RESPONSE(swfs));
    } catch (err) {
      switch (err.name) {
        case NO_DATA_INDEX_URL:
          response
            .status(400)
            .json(
              ApiResponseBuilder.VALIDATION_ERR_RESPONSE(err.name, err.message),
            );
          break;
        default: {
          logger.error(err);
          response
            .status(500)
            .json({ err: `Unhandled Internal error:${err.message}` });
          break;
        }
      }
    }
  });

  router.use(errorHandler());
  return router;
}
