import 'reflect-metadata';

import { HttpError } from 'http-errors';
import * as createHttpError from 'http-errors';

import { middlewarePositionBefore, middlewarePositionAfter } from './constants';
import { createErrorResponse, createSuccessResponse } from './response';
import { MiddlewareBefore } from './types';

export function handler(
  target: any,
  propertyName: string,
  descriptor: TypedPropertyDescriptor<Function>,
) {
  const originalMethod = descriptor.value;

  // eslint-disable-next-line no-param-reassign
  descriptor.value = async function method(...args) {
    const event = args[0];

    await (Reflect.getOwnMetadata(middlewarePositionBefore, target, propertyName) || [])
      .reduce((prevMiddleware, middleware: MiddlewareBefore) => prevMiddleware
        .then(() => middleware(target, propertyName, event, args)), Promise.resolve());

    let response;

    try {
      const result = await originalMethod.apply(this, args);

      response = createSuccessResponse(result);
    } catch (error) {
      let typedError;
      if (error instanceof HttpError) {
        typedError = error;
      } else if (error instanceof Error) {
        typedError = Object.assign(new createHttpError.InternalServerError(error.message), error);
      } else {
        typedError = new createHttpError.InternalServerError(error);
      }

      (Reflect.getOwnMetadata(middlewarePositionAfter, target, propertyName) || [])
        .reduce((prevMiddleware, middleware) => prevMiddleware
          .then(() => middleware(target, propertyName, event, args)), Promise.resolve());

      response = createErrorResponse(typedError);
    }

    return response;
  };
}
