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
export declare class ContextError extends Internal {
    readonly context?: Record<string, any>;
    /**
     * Creates an instance of CustomError
     *
     * @param data Error data
     * @param message Error message
     */
    constructor(data?: Record<string, any>, message?: string);
    toJSON(): {
        code: number;
        name: string;
        message: string;
    } & Record<string, any>;
}
