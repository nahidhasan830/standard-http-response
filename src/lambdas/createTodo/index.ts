import Todo from '../../model/todoModel';
import { ReqBody } from './ReqBody';
import { createLambdaHandler } from '../../Middleware';

export const handler = createLambdaHandler(
  ReqBody,
  async (request, context, httpResponseBuilder) => {
    const { Description, Priority, Title } = request;

    const data = await Todo.create({
      Description,
      Priority,
      Title,
      Id: Math.trunc(Math.random() * 100000).toString()
    });

    return httpResponseBuilder(201)
      .withSuccessMessage('created!', 'document successfully created!')
      .withData(data);
  }
);
