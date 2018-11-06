import { Contract } from './types';
export declare class HttpError extends Error {
    readonly code: number;
    /**
     * Creates an instance of HttpError
     *
     * @param code Error code
     * @param message Error message
     */
    constructor(code: number, message?: string);
    toJSON(): {
        code: number;
        name: string;
        message: string;
    };
}
export declare class BadRequest extends HttpError {
    /**
     * Creates an instance of BadRequest
     *
     * @param message Error message
     */
    constructor(message?: string);
}
export declare class Unauthorized extends HttpError {
    /**
     * Creates an instance of Unauthorized
     *
     * @param message Error message
     */
    constructor(message?: string);
}
export declare class Forbidden extends HttpError {
    /**
     * Creates an instance of Unauthorized
     *
     * @param message Error message
     */
    constructor(message?: string);
}
export declare class NotFound extends HttpError {
    /**
     * Creates an instance of NotFound
     *
     * @param message Error message
     */
    constructor(message?: string);
}
export declare class Conflict extends HttpError {
    /**
     * Creates an instance of Conflict
     *
     * @param message Error message
     */
    constructor(message?: string);
}
export declare class Expired extends HttpError {
    /**
     * Creates an instance of Expired
     *
     * @param message Error message
     */
    constructor(message?: string);
}
export declare class NotImplemented extends HttpError {
    /**
     * Creates an instance of NotImplemented
     *
     * @param message Error message
     */
    constructor(message?: string);
}
export declare class Internal extends HttpError {
    /**
     * Creates an instance of NotImplemented
     *
     * @param message Error message
     */
    constructor(message?: string);
}
export declare class ServiceError extends Error {
    readonly state: number;
    /**
     * Creates an instance of HttpError
     *
     * @param service Service instance
     * @param contract Contract
     */
    constructor(service: any, contract: Contract);
    /**
     * Creates an instance of HttpError
     *
     * @param service Service instance
     * @param state Error code
     * @param message Error message
     */
    constructor(service: any, state: number, message: string);
    toJSON(): {
        state: number;
        name: string;
        message: string;
    };
}
