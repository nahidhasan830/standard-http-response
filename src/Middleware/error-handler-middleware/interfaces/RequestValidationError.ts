export type TypeClassValidationError = {
    target: Record<string, unknown>;
    value: string;
    property: string;
    constraints: Record<string, string>;
};

export class RequestValidationError {
    statusCode = 400;
    details: Record<string, any>;
    message: string;
    name: string;

    constructor(errors: TypeClassValidationError[]) {
        this.name = 'RequestValidationFailed';
        this.message = 'Invalid request parameters validation failed';
        const details: Record<string, any> = {};
        for (const singleError of errors) {
            const { constraints, property } = singleError;
            if (property && constraints) {
                details[`${property}`] = constraints;
            }
        }
        this.details = details;
    }
}
