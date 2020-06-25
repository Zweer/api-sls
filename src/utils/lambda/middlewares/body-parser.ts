import 'reflect-metadata';

import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { parse as parseContentType } from 'content-type';
import * as createHttpError from 'http-errors';
import * as querystring from 'querystring';

import { middlewarePositionBefore } from '../constants';
import { MiddlewareBefore } from '../types';

const bodyMetadataKey = Symbol('body');
const bodyEntireKey = Symbol('entire body');
const bodyMiddlewareAdded = Symbol('Body Middleware Added');

function parseBody(event: APIGatewayProxyEventV2): object {
  if (!event.headers) {
    return {};
  }

  const contentTypeHeader = event.headers['content-type'] || event.headers['Content-Type'];
  if (!contentTypeHeader) {
    return {};
  }

  const { type } = parseContentType(contentTypeHeader);
  if (type === 'application/json') {
    try {
      return JSON.parse(event.body);
    } catch (err) {
      throw new createHttpError.UnprocessableEntity('Content type defined as JSON but an invalid JSON was provided');
    }
  } else if (type === 'application/x-www-form-urlencoded') {
    return querystring.parse(event.body);
  } else {
    throw new createHttpError.UnprocessableEntity('Invalid content type');
  }
}

const handleBody: MiddlewareBefore = async (
  target: any,
  propertyName: string,
  event: APIGatewayProxyEventV2,
  args: any[],
) => {
  const body = parseBody(event);

  const bodyMetadata = Reflect.getOwnMetadata(bodyMetadataKey, target, propertyName) || [];
  bodyMetadata.forEach(({ paramKey, paramIndex }) => {
    // eslint-disable-next-line no-param-reassign
    args[paramIndex] = body && paramKey === bodyEntireKey ? body : body[paramKey];
  });
};

export function bodyParser(target: any, propertyName: string) {
  const beforeMiddlewares = Reflect
    .getOwnMetadata(middlewarePositionBefore, target, propertyName) || [];
  const isBodyMiddlewareAdded = Reflect
    .getOwnMetadata(bodyMiddlewareAdded, target, propertyName) || false;

  if (!isBodyMiddlewareAdded) {
    beforeMiddlewares.push(handleBody);
    Reflect.defineMetadata(middlewarePositionBefore, beforeMiddlewares, target, propertyName);
    Reflect.defineMetadata(bodyMiddlewareAdded, true, target, propertyName);
  }
}

export const body = (paramKey: string | Symbol = bodyEntireKey) => (
  target: Object,
  propertyKey: string,
  paramIndex: number,
) => {
  bodyParser(target, propertyKey);

  const existingBodyMetadata = Reflect.getOwnMetadata(bodyMetadataKey, target, propertyKey) || [];

  existingBodyMetadata.push({ paramKey, paramIndex });

  Reflect.defineMetadata(bodyMetadataKey, existingBodyMetadata, target, propertyKey);
};
