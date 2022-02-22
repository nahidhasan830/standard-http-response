export interface IErrorInfo {
  status?: string;
  statusCode?: number;
  message: string;
  isOperational?: boolean;
  errorMessage?: string;

}

export interface ISuccessInfo {
  statusCode?: number;
  message?: string;
  data?: any;
}

export interface ILambdaError {
  errorType: string;
  errorMessage: string;
  stack: [];
}
