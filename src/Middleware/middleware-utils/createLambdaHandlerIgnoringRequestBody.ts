import { composeHandler } from '@lambda-middleware/compose';
import { APIGatewayEvent, Context, APIGatewayProxyResult } from 'aws-lambda';
import { LambdaRequestContext } from '.';
import { WithBody, errorHandler } from '..';
import { CustomHttpResponse, customHttpResponse } from '..';

export const createLambdaHandlerIgnoringRequestBody = (
  executeBusinessLogic: (
    context: LambdaRequestContext,
    customHttpResponse: (statusCode: number) => CustomHttpResponse
  ) => Promise<CustomHttpResponse>
) => {
  const handlerWrapper = async (
    event: WithBody<APIGatewayEvent, string | null>,
    context: Context
  ): Promise<APIGatewayProxyResult> => {
    const environment = event?.stageVariables?.Environment || 'dev';

    const response = await executeBusinessLogic(
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
      customHttpResponse
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

  return composeHandler(errorHandler(), handlerWrapper);
};
