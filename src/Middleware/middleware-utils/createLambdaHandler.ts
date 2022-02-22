import { composeHandler } from '@lambda-middleware/compose';
import { errorHandler } from '../error-handler-middleware';
import {
  incomingRequestValidator,
  WithBody
} from '../incoming-request-validator';
import { ClassType } from 'class-transformer-validator';
import {
  APIGatewayEvent,
  APIGatewayEventDefaultAuthorizerContext,
  APIGatewayProxyEventPathParameters,
  APIGatewayProxyResult,
  Context,
  APIGatewayProxyEventQueryStringParameters,
  APIGatewayProxyEventHeaders
} from 'aws-lambda';
import { CustomHttpResponse, httpResponseBuilder } from '..';

export type LambdaRequestContext = {
  environment: string;
  userName: string;
  userId: string;
  pathParameters: APIGatewayProxyEventPathParameters | null;
  queryStringParameters: APIGatewayProxyEventQueryStringParameters | null;
  authorizer: APIGatewayEventDefaultAuthorizerContext;
  headers: APIGatewayProxyEventHeaders;
};

export const createLambdaHandler = <TRequest extends object>(
  requestModel: ClassType<TRequest>,
  executeBusinessLogic: (
    request: TRequest,
    context: LambdaRequestContext,
    httpResponseBuilder: (statusCode: number) => CustomHttpResponse
  ) => Promise<CustomHttpResponse>
) => {
  const handlerWrapper = async (
    event: WithBody<APIGatewayEvent, TRequest>,
    context: Context
  ): Promise<APIGatewayProxyResult> => {
    const environment = event?.stageVariables?.Environment || 'dev';

    const response = await executeBusinessLogic(
      event.body,
      {
        environment,
        userName:
          event.requestContext.authorizer?.claims['cognito:username'] ??
          'user-name',
        userId: 'loggedInUserId',
        pathParameters: event.pathParameters,
        queryStringParameters: event.queryStringParameters,
        authorizer: event.requestContext.authorizer,
        headers: event.headers
      },
      httpResponseBuilder
    );

    console.log('response is ', JSON.stringify(response));

    return {
      headers: response.headers,
      isBase64Encoded: false,
      multiValueHeaders: {},
      statusCode: response.statusCode,
      body: JSON.stringify(response.body)
    };
  };

  return composeHandler(
    errorHandler(),
    incomingRequestValidator({
      bodyType: requestModel
    }),
    handlerWrapper
  );
};
