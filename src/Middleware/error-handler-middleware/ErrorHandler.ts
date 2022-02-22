import { PromiseHandler } from '@lambda-middleware/utils';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context
} from 'aws-lambda';
import { corsHeader } from '../middleware-utils/constants/Constants';
import { isErrorWithStatusCode } from './interfaces/ErrorWithStatusCode';

export enum ApiResponseMessageLevel {
  Error,
  Warning,
  Information,
  Success
}

export class ApiResponseMessage {
  constructor(code: string, text: string, level: ApiResponseMessageLevel) {
    this.code = code;
    this.text = text;
    this.level = level;
  }

  code: string;
  text: string;
  level: ApiResponseMessageLevel;
}

export class ApiResponse<T extends void | unknown> {
  messages: ApiResponseMessage[] = [];
  data?: T;

  constructor(message: ApiResponseMessage[], data?: T) {
    this.messages = message;
    this.data = data;
  }

  get isValid(): boolean {
    return this.messages.some(
      message => message.level === ApiResponseMessageLevel.Error
    );
  }
}

export class CustomHttpResponse {
  readonly body = new ApiResponse([]);
  readonly statusCode: number;
  readonly headers = corsHeader;

  constructor(statusCode: number) {
    this.statusCode = statusCode;
  }

  withMessage(code: string, message: string, level: ApiResponseMessageLevel) {
    this.body.messages = [
      ...this.body.messages,
      new ApiResponseMessage(code, message, level)
    ];
    return this;
  }

  withData(data: any) {
    this.body.data = data;
    return this;
  }

  withMessagesArray(messages: ApiResponseMessage[]) {
    this.body.messages = [...this.body.messages, ...messages];
    return this;
  }

  withSuccessMessage(code: string, message: string) {
    const level = ApiResponseMessageLevel.Success;
    this.body.messages.push(new ApiResponseMessage(code, message, level));
    return this;
  }
  withErrorMessage(code: string, message: string) {
    const level = ApiResponseMessageLevel.Error;
    this.body.messages.push(new ApiResponseMessage(code, message, level));
    return this;
  }

  withInfoMessage(code: string, message: string) {
    const level = ApiResponseMessageLevel.Information;
    this.body.messages.push(new ApiResponseMessage(code, message, level));
    return this;
  }

  withWarningMessage(code: string, message: string) {
    const level = ApiResponseMessageLevel.Warning;
    this.body.messages.push(new ApiResponseMessage(code, message, level));
    return this;
  }
}

export const httpResponseBuilder = (statusCode: number) =>
  new CustomHttpResponse(statusCode);

export const errorHandler =
  () =>
  (
    handler: PromiseHandler<APIGatewayProxyEvent, APIGatewayProxyResult>
  ): PromiseHandler<APIGatewayProxyEvent, APIGatewayProxyResult> =>
  async (
    event: APIGatewayProxyEvent,
    context: Context
  ): Promise<APIGatewayProxyResult> => {
    try {
      return await handler(event, context);
    } catch (error: any) {
      console.log('🔥🔥🔥 ERROR OCCURED! 🔥🔥🔥');
      console.log(error);
      if (error.message) {
        // 1. when use manually throw then it comes here
        // with structure: { message: string }
        // 2. When primary key not passed to dynamoose
        // error also handle here.
        // 3. When request body validation failed, it also comes here

        const text = error.message;
        const code = error.name || 'error';
        const level = ApiResponseMessageLevel.Error;
        const errorMessage = new ApiResponseMessage(code, text, level);
        let errorMessagesArr = [errorMessage];

        if (code === 'RequestValidationFailed') {
          // that means it is from class validator
          errorMessagesArr = [];
          for (const [property, value] of Object.entries(
            error.details as { object: object }
          )) {
            for (const [errorName, message] of Object.entries(value)) {
              errorMessagesArr.push({ code: errorName, text: message, level });
            }
          }
        }
        const response = new CustomHttpResponse(400).withMessagesArray(
          errorMessagesArr
        );
        return {
          headers: response.headers,
          statusCode: response.statusCode,
          body: JSON.stringify(response.body)
        };
      }

      if ((error as any).errorMessage) {
        // reference error comes to this block. But it will not happen because of TS
        const text = error.errorMessage;
        const code = error.name || 'error';
        const level = ApiResponseMessageLevel.Error;
        const errorMessage = new ApiResponseMessage(code, text, level);
        let errorMessagesArr = [errorMessage];

        const response = new CustomHttpResponse(400).withMessagesArray(
          errorMessagesArr
        );

        return {
          headers: response.headers,
          statusCode: response.statusCode,
          body: JSON.stringify(response.body)
        };
      }

      if (isErrorWithStatusCode(error) && error.statusCode < 500) {
        console.log('-----Error Occurred-----');
        console.log(JSON.stringify(error));
        console.log('-----I was from first block-----');
        return {
          body: JSON.stringify({
            error,
            message: 'Something went wrong!Please contact administrator'
          }),
          headers: corsHeader,
          statusCode: error.statusCode
        };
      }

      return {
        body: JSON.stringify({
          message: 'Something went wrong. Please contact administrator'
        }),
        headers: corsHeader,
        statusCode: 500
      };
    }
  };
