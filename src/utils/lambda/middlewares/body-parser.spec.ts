import { APIGatewayProxyEventV2 } from 'aws-lambda';
import * as HttpStatus from 'http-status-codes';

import { body, bodyParser } from './body-parser';

import { handler } from '..';

describe('Body Parser', () => {
  class TestEndpoints {
    @handler
    @bodyParser
    // eslint-disable-next-line class-methods-use-this
    async handleOneParamWithInit(@body('id') id) {
      return { id };
    }

    @handler
    // eslint-disable-next-line class-methods-use-this
    async handleOneParamWithoutInit(@body('id') id) {
      return { id };
    }

    @handler
    // eslint-disable-next-line class-methods-use-this
    async handleTwoParamsWithoutInit(@body('id') id, @body('action') action?) {
      return { id, action };
    }
  }

  const testEndpoints = new TestEndpoints();

  const id = 'foo';
  const action = 'list';

  const baseEvent: APIGatewayProxyEventV2 = {
    version: '2.0',
    routeKey: 'test',
    rawPath: `test/${id}`,
    rawQueryString: '',
    headers: { 'content-type': '' },
    requestContext: {} as APIGatewayProxyEventV2['requestContext'],
    isBase64Encoded: false,
    body: '',
  };

  function testBodyParam(event: APIGatewayProxyEventV2) {
    test('it should work with one body param and the init', async () => {
      const response = await testEndpoints.handleOneParamWithInit(event);

      const bodyObj = {
        statusCode: 200,
        status: HttpStatus.getStatusText(200),
        data: { id },
      };

      expect(response).toHaveProperty('statusCode', 200);
      expect(response).toHaveProperty('body', JSON.stringify(bodyObj));
    });

    test('it should work with one body param but without the init', async () => {
      const response = await testEndpoints.handleOneParamWithoutInit(event);

      const bodyObj = {
        statusCode: 200,
        status: HttpStatus.getStatusText(200),
        data: { id },
      };

      expect(response).toHaveProperty('statusCode', 200);
      expect(response).toHaveProperty('body', JSON.stringify(bodyObj));
    });

    test('it should work with two body params but without the init', async () => {
      const response = await testEndpoints.handleTwoParamsWithoutInit(event);

      const bodyObj = {
        statusCode: 200,
        status: HttpStatus.getStatusText(200),
        data: { id, action },
      };

      expect(response).toHaveProperty('statusCode', 200);
      expect(response).toHaveProperty('body', JSON.stringify(bodyObj));
    });
  }

  describe('JSON', () => {
    baseEvent.headers['content-type'] = 'application/json';
    baseEvent.body = JSON.stringify({ id, action });

    testBodyParam(baseEvent);
  });

  describe('Url encoded', () => {
    baseEvent.headers['content-type'] = 'application/x-www-form-urlencoded';
    baseEvent.body = `id=${id}&action=${action}`;

    testBodyParam(baseEvent);
  });
});
