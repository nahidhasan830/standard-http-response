import { Document } from 'dynamoose/dist/Document';
import { ITodo } from './IRequestBody';

export interface ITodoDocument extends ITodo, Document {
  Id: string;
}
