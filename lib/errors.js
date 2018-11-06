"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HttpError extends Error {
    /**
     * Creates an instance of HttpError
     *
     * @param code Error code
     * @param message Error message
     */
    constructor(code, message) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
        this.code = code;
    }
    toJSON() {
        return {
            code: this.code || 500,
            name: this.name || 'Unknown',
            message: this.message
        };
    }
}
exports.HttpError = HttpError;
class BadRequest extends HttpError {
    /**
     * Creates an instance of BadRequest
     *
     * @param message Error message
     */
    constructor(message) {
        super(400, message || 'Bad Request');
    }
}
exports.BadRequest = BadRequest;
class Unauthorized extends HttpError {
    /**
     * Creates an instance of Unauthorized
     *
     * @param message Error message
     */
    constructor(message) {
        super(401, message || 'Unauthorized');
    }
}
exports.Unauthorized = Unauthorized;
class Forbidden extends HttpError {
    /**
     * Creates an instance of Unauthorized
     *
     * @param message Error message
     */
    constructor(message) {
        super(403, message || 'Forbidden');
    }
}
exports.Forbidden = Forbidden;
class NotFound extends HttpError {
    /**
     * Creates an instance of NotFound
     *
     * @param message Error message
     */
    constructor(message) {
        super(404, message || 'Not Found');
    }
}
exports.NotFound = NotFound;
class Conflict extends HttpError {
    /**
     * Creates an instance of Conflict
     *
     * @param message Error message
     */
    constructor(message) {
        super(409, message || 'Conflict');
    }
}
exports.Conflict = Conflict;
class Expired extends HttpError {
    /**
     * Creates an instance of Expired
     *
     * @param message Error message
     */
    constructor(message) {
        super(410, message || 'Expired');
    }
}
exports.Expired = Expired;
class NotImplemented extends HttpError {
    /**
     * Creates an instance of NotImplemented
     *
     * @param message Error message
     */
    constructor(message) {
        super(501, message || 'Not Implemented');
    }
}
exports.NotImplemented = NotImplemented;
class Internal extends HttpError {
    /**
     * Creates an instance of NotImplemented
     *
     * @param message Error message
     */
    constructor(message) {
        super(500, message || 'Internal Error');
    }
}
exports.Internal = Internal;
class ServiceError extends Error {
    constructor(service, arg1, arg2) {
        let message, state;
        if (typeof arg1 === 'number') {
            state = arg1;
            message = arg2;
        }
        else {
            state = arg1.state;
            message = arg1.msg;
        }
        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.state = state;
        this.name = service.constructor.name;
    }
    toJSON() {
        return {
            state: this.state,
            name: this.name || 'Unknown',
            message: this.message
        };
    }
}
exports.ServiceError = ServiceError;
