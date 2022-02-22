import Todo from '../../model/todoModel';
import { createLambdaHandlerIgnoringRequestBody } from '../../Middleware';

export const handler = createLambdaHandlerIgnoringRequestBody(
  async (context, responseBuilder) => {
    const Id = `${context.queryStringParameters?.Id}`;

    const data = await Todo.get(Id);

    if (!data)
      return responseBuilder(400).withErrorMessage(
        'notFound',
        'Requested Data Not Found!'
      );

    return responseBuilder(200)
      .withSuccessMessage('success', 'Requested Data Found!')
      .withData(data);
  }
);
