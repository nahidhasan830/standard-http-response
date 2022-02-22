export class RuntimeError {
    statusCode = 404;
    message: string;
    name: string;
    constructor(message: string) {
        this.name = 'RuntimeError';
        this.message = message;
    }
}
