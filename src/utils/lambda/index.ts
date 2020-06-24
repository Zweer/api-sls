import { HttpError } from 'http-errors';
import * as createHttpError from 'http-errors';

import { createErrorResponse, createSuccessResponse } from './response';

export function handler(
  _target: any,
  _propertyName: string,
  descriptor: TypedPropertyDescriptor<Function>,
) {
  const originalMethod = descriptor.value;

  // eslint-disable-next-line no-param-reassign
  descriptor.value = async function method(...args) {
    // const event = args[0];

    try {
      const result = await originalMethod.apply(this, args);

      return createSuccessResponse(result);
    } catch (error) {
      const typedError = error instanceof HttpError
        ? error
        : new createHttpError.InternalServerError(error);

      return createErrorResponse(typedError);
    }
  };
}
