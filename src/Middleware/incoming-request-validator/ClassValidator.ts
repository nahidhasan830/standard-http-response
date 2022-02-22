import { PromiseHandler } from '@lambda-middleware/utils';
import { APIGatewayEvent, Context } from 'aws-lambda';
import { ClassValidatorMiddlewareOptions } from './interfaces/ClassValidatorMiddlewareOptions';
import { transformAndValidate } from 'class-transformer-validator';
import { RequestValidationError, TypeClassValidationError } from '../error-handler-middleware/interfaces/RequestValidationError';

export type WithBody<Event, Body> = Omit<Event, 'body'> & { body: Body };

export const incomingRequestValidator =
    <T extends object>(options: ClassValidatorMiddlewareOptions<T>) =>
    <R>(handler: PromiseHandler<WithBody<APIGatewayEvent, T>, R>) =>
    async (event: APIGatewayEvent, context: Context): Promise<R> => {
        try {
            const body = event.body ?? '{}';
            const { transformer } = options;
            const validator = options.validator ?? {
                whitelist: true
            };

            const transformedBody = (await transformAndValidate(options.bodyType, body === '' ? '{}' : body, { transformer, validator })) as T;
            return handler({ ...event, body: transformedBody }, context);
        } catch (error) {
            const typedErrors = error as TypeClassValidationError[];
            throw new RequestValidationError(typedErrors);
        }
    };
