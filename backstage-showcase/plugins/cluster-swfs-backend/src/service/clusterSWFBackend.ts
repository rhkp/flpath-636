import { Swf } from '../types/swf';
import { Client, cacheExchange, fetchExchange } from '@urql/core';
import { BackendExecCtx } from '../types/backendExecCtx';
import { ErrorBuilder } from '../helpers/errorBuilder';
import { DEFAULT_DATA_INDEX_URL } from '../types/constants';

export class ClusterSWFBackend {
  public static backendExecCtx: BackendExecCtx;
  private static inited = false;

  public static initialize(backendExecCtx: BackendExecCtx) {
    if (!backendExecCtx) {
      throw ErrorBuilder.GET_NO_BACKEND_EXEC_CTX_ERR();
    }

    if (
      !backendExecCtx.dataIndexUrl ||
      backendExecCtx.dataIndexUrl.length === 0
    ) {
      throw ErrorBuilder.GET_NO_DATA_INDEX_URL_ERR();
    }

    if (!backendExecCtx.client) {
      throw ErrorBuilder.GET_NO_CLIENT_PROVIDED_ERR();
    }

    if (!this.inited) {
      this.backendExecCtx = backendExecCtx;
      this.inited = true;
      this.backendExecCtx.logger.info('Initialized the swf backend');
    }
  }

  public static getNewGraphQLClient(
    dataIndexUrl = DEFAULT_DATA_INDEX_URL,
  ): Client {
    const diURL =
      this.backendExecCtx && this.backendExecCtx.dataIndexUrl
        ? this.backendExecCtx.dataIndexUrl
        : dataIndexUrl;
    return new Client({
      url: diURL,
      exchanges: [cacheExchange, fetchExchange],
    });
  }

  private static getDeployedSwfsQuery() {
    return `
        query ProcessDefinitions {
            ProcessDefinitions {
                id
                name
                version
                type
                endpoint
                serviceUrl
            }
        }
      `;
  }

  public static async getSWFs(): Promise<Swf[]> {
    if (!this.inited) {
      throw ErrorBuilder.GET_SWF_BACKEND_NOT_INITED();
    }
    const QUERY = this.getDeployedSwfsQuery();
    this.backendExecCtx.logger.info(
      `getSWFs() called:  ${this.backendExecCtx.dataIndexUrl}`,
    );
    const result = await this.backendExecCtx.client.query(QUERY, {});

    if (result.error) {
      this.backendExecCtx.logger.error(
        `Error fetching data index swf results ${result.error}`,
      );
      throw result.error;
    }
    return result.data.ProcessDefinitions;
  }
}
