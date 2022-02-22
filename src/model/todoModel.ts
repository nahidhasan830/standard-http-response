import { Schema, model } from 'dynamoose';
import { ITodoDocument } from '../interfaces/ITodoDocument';

const todoSchema = new Schema(
  {
    Id: { type: String, required: true },
    Title: { type: String, required: true },
    Description: { type: String },
    Priority: {
      type: String,
      required: true,
      enum: ['high', 'low', 'normal'],
      default: 'normal'
    }
  },
  {
    timestamps: true
  }
);

const tableName = 'prod-Todo';

const Todo = model<ITodoDocument>(tableName, todoSchema, {
  create: false
});

export default Todo;
