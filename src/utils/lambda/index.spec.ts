import * as createHttpError from 'http-errors';
import * as HttpStatus from 'http-status-codes';

import { handler } from '.';

describe('Lambda', () => {
  class TestEndpoints {
    @handler
    // eslint-disable-next-line class-methods-use-this
    async handlerOk(data) {
      return data;
    }

    @handler
    // eslint-disable-next-line class-methods-use-this
    async handlerKo500(message) {
      throw new createHttpError.InternalServerError(message);
    }

    @handler
    // eslint-disable-next-line class-methods-use-this
    async handlerKo(message) {
      throw new Error(message);
    }
  }

  const testEndpoints = new TestEndpoints();

  test('Endpoint with success result', async () => {
    const data = { foo: 'bar' };
    const response = await testEndpoints.handlerOk(data);

    const body = {
      statusCode: 200,
      status: HttpStatus.getStatusText(200),
      data,
    };

    expect(response).toHaveProperty('statusCode', 200);
    expect(response).toHaveProperty('body', JSON.stringify(body));
  });

  test('Endpoint with error result', async () => {
    const message = 'foo';
    const response = await testEndpoints.handlerKo500(message);

    const body = {
      statusCode: createHttpError.InternalServerError.prototype.status,
      status: HttpStatus.getStatusText(createHttpError.InternalServerError.prototype.status),
      error: new createHttpError.InternalServerError(message),
    };

    expect(response).toHaveProperty('statusCode', createHttpError.InternalServerError.prototype.status);
    expect(response).toHaveProperty('body', JSON.stringify(body));
  });

  test('Endpoint with implicit error result', async () => {
    const message = 'foo';
    const response = await testEndpoints.handlerKo(message);

    const body = {
      statusCode: createHttpError.InternalServerError.prototype.status,
      status: HttpStatus.getStatusText(createHttpError.InternalServerError.prototype.status),
      error: new createHttpError.InternalServerError(message),
    };

    expect(response).toHaveProperty('statusCode', createHttpError.InternalServerError.prototype.status);
    expect(response).toHaveProperty('body', JSON.stringify(body));
  });
});
