import { APIGatewayProxyResult } from 'aws-lambda';
import { HttpError } from 'http-errors';
import * as HttpStatus from 'http-status-codes';

function createResponse(
  bodyObj: object,
  statusCode: number,
): APIGatewayProxyResult {
  const bodyEnriched = {
    statusCode,
    status: HttpStatus.getStatusText(statusCode),

    ...bodyObj,
  };
  const body = JSON.stringify(bodyEnriched);

  return { statusCode, body };
}

export function createErrorResponse(error: HttpError) {
  return createResponse({ error }, error.statusCode);
}

export function createSuccessResponse(data: any, statusCode: number = 200) {
  return createResponse({ data }, statusCode);
}
