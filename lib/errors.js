"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HttpError extends Error {
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
    constructor(message) {
        super(400, message || 'Bad Request');
    }
}
exports.BadRequest = BadRequest;
class Unauthorized extends HttpError {
    constructor(message) {
        super(401, message || 'Unauthorized');
    }
}
exports.Unauthorized = Unauthorized;
class Forbidden extends HttpError {
    constructor(message) {
        super(403, message || 'Forbidden');
    }
}
exports.Forbidden = Forbidden;
class NotFound extends HttpError {
    constructor(message) {
        super(404, message || 'Not Found');
    }
}
exports.NotFound = NotFound;
class Conflict extends HttpError {
    constructor(message) {
        super(409, message || 'Conflict');
    }
}
exports.Conflict = Conflict;
class Expired extends HttpError {
    constructor(message) {
        super(410, message || 'Expired');
    }
}
exports.Expired = Expired;
class NotImplemented extends HttpError {
    constructor(message) {
        super(501, message || 'Not Implemented');
    }
}
exports.NotImplemented = NotImplemented;
class Internal extends HttpError {
    constructor(state, message) {
        super(500, message || 'Internal Error');
        this.state = state;
    }
}
exports.Internal = Internal;
