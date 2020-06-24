import * as createHttpError from 'http-errors';
import * as HttpStatus from 'http-status-codes';

import { createErrorResponse, createSuccessResponse } from './response';

describe('Lambda -> Response', () => {
  const message = 'foo';

  describe('Create Error Response', () => {
    test('it should work with httpErrors', () => {
      const error = new createHttpError.InternalServerError(message);
      const response = createErrorResponse(error);

      const body = {
        statusCode: createHttpError.InternalServerError.prototype.status,
        status: HttpStatus.getStatusText(createHttpError.InternalServerError.prototype.status),
        error,
      };

      expect(response).toHaveProperty('statusCode', createHttpError.InternalServerError.prototype.status);
      expect(response).toHaveProperty('body', JSON.stringify(body));
    });
  });

  describe('Create Success Response', () => {
    const statusCode = 201;

    test('it should work with 2 params', () => {
      const data = { foo: 'bar' };
      const response = createSuccessResponse(data, statusCode);

      const body = {
        statusCode,
        status: HttpStatus.getStatusText(statusCode),
        data,
      };

      expect(response).toHaveProperty('statusCode', statusCode);
      expect(response).toHaveProperty('body', JSON.stringify(body));
    });

    test('it should work with 1 param', () => {
      const data = { foo: 'bar' };
      const response = createSuccessResponse(data);

      const body = {
        statusCode: 200,
        status: HttpStatus.getStatusText(200),
        data,
      };

      expect(response).toHaveProperty('statusCode', 200);
      expect(response).toHaveProperty('body', JSON.stringify(body));
    });
  });
});
