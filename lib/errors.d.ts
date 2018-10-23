export declare class HttpError extends Error {
    readonly code: number;
    constructor(code: number, message?: string);
    toJSON(): {
        code: number;
        name: string;
        message: string;
    };
}
export declare class BadRequest extends HttpError {
    constructor(message?: string);
}
export declare class Unauthorized extends HttpError {
    constructor(message?: string);
}
export declare class Forbidden extends HttpError {
    constructor(message?: string);
}
export declare class NotFound extends HttpError {
    constructor(message?: string);
}
export declare class Conflict extends HttpError {
    constructor(message?: string);
}
export declare class Expired extends HttpError {
    constructor(message?: string);
}
export declare class NotImplemented extends HttpError {
    constructor(message?: string);
}
export declare class Internal extends HttpError {
    readonly state: number;
    constructor(state: number, message?: string);
}
