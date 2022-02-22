import { validateOrReject } from 'class-validator';
import createError from 'http-errors';

export const validateDatabaseModel = async <T extends object>(databaseModel: T) => {
    try {
        await validateOrReject(databaseModel);
    } catch (errors) {
        let errorMessages: string[] = [];
        for (const singleError of errors as any[]) {
            const constraints = singleError.constraints;
            if (constraints) errorMessages = errorMessages.concat(Object.values(constraints));
        }
        console.log('database model validation error -> ', JSON.stringify(errors));
        throw new createError.BadRequest(JSON.stringify(errorMessages));
    }
};
