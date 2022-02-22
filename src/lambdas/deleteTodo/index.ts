import {
  Handler,
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2
} from 'aws-lambda';

type ProxyHandler = Handler<APIGatewayProxyEventV2, APIGatewayProxyResultV2>;

export const handler: ProxyHandler = async (event, context) => {
  return {
    statusCode: 204,
    body: JSON.stringify({
      status: 'success',
      message: 'Todo has been deleted successfully!',
      requestBody: event.body
    })
  };
};
