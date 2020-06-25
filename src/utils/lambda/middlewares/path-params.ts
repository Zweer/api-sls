import 'reflect-metadata';

import { APIGatewayProxyEventV2 } from 'aws-lambda';

import { middlewarePositionBefore } from '../constants';
import { MiddlewareBefore } from '../types';

const paramMetadataKey = Symbol('param');
const pathParamsMiddlewareAdded = Symbol('PathParams Middleware Added');

const handlePathParams: MiddlewareBefore = async (
  target: any,
  propertyName: string,
  event: APIGatewayProxyEventV2,
  args: any[],
) => {
  const paramMetadata = Reflect.getOwnMetadata(paramMetadataKey, target, propertyName) || [];
  paramMetadata.forEach(({ paramKey, paramIndex }) => {
    // eslint-disable-next-line no-param-reassign
    args[paramIndex] = event.pathParameters && event.pathParameters[paramKey];
  });
};

export function pathParams(target: any, propertyName: string) {
  const beforeMiddlewares = Reflect
    .getOwnMetadata(middlewarePositionBefore, target, propertyName) || [];
  const isPathParamsMiddlewareAdded = Reflect
    .getOwnMetadata(pathParamsMiddlewareAdded, target, propertyName) || false;

  if (!isPathParamsMiddlewareAdded) {
    beforeMiddlewares.push(handlePathParams);
    Reflect.defineMetadata(middlewarePositionBefore, beforeMiddlewares, target, propertyName);
    Reflect.defineMetadata(pathParamsMiddlewareAdded, true, target, propertyName);
  }
}

export const param = (paramKey) => (target: Object, propertyKey: string, paramIndex: number) => {
  pathParams(target, propertyKey);

  const existingParamMetadata = Reflect.getOwnMetadata(paramMetadataKey, target, propertyKey) || [];

  existingParamMetadata.push({ paramKey, paramIndex });

  Reflect.defineMetadata(paramMetadataKey, existingParamMetadata, target, propertyKey);
};
