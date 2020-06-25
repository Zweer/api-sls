import { APIGatewayProxyEventV2 } from 'aws-lambda';
import * as HttpStatus from 'http-status-codes';

import { param, pathParams } from './path-params';

import { handler } from '..';

describe('Path Params', () => {
  class TestEndpoints {
    @handler
    @pathParams
    // eslint-disable-next-line class-methods-use-this
    async handleOneParamWithInit(@param('id') id) {
      return { id };
    }

    @handler
    // eslint-disable-next-line class-methods-use-this
    async handleOneParamWithoutInit(@param('id') id) {
      return { id };
    }

    @handler
    // eslint-disable-next-line class-methods-use-this
    async handleTwoParamsWithoutInit(@param('id') id, @param('action') action?) {
      return { id, action };
    }
  }

  const testEndpoints = new TestEndpoints();

  const id = 'foo';
  const action = 'list';
  const event: APIGatewayProxyEventV2 = {
    version: '2.0',
    routeKey: 'test',
    rawPath: `test/${id}`,
    rawQueryString: '',
    headers: {},
    requestContext: {} as APIGatewayProxyEventV2['requestContext'],
    pathParameters: { id, action },
    isBase64Encoded: false,
  };

  test('it should work with one param and the init', async () => {
    const response = await testEndpoints.handleOneParamWithInit(event);

    const body = {
      statusCode: 200,
      status: HttpStatus.getStatusText(200),
      data: { id },
    };

    expect(response).toHaveProperty('statusCode', 200);
    expect(response).toHaveProperty('body', JSON.stringify(body));
  });

  test('it should work with one param but without the init', async () => {
    const response = await testEndpoints.handleOneParamWithoutInit(event);

    const body = {
      statusCode: 200,
      status: HttpStatus.getStatusText(200),
      data: { id },
    };

    expect(response).toHaveProperty('statusCode', 200);
    expect(response).toHaveProperty('body', JSON.stringify(body));
  });

  test('it should work with two params but without the init', async () => {
    const response = await testEndpoints.handleTwoParamsWithoutInit(event);

    const body = {
      statusCode: 200,
      status: HttpStatus.getStatusText(200),
      data: { id, action },
    };

    expect(response).toHaveProperty('statusCode', 200);
    expect(response).toHaveProperty('body', JSON.stringify(body));
  });
});
