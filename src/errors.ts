import { Contract } from './types'

export class HttpError extends Error {
    readonly code: number

    /**
     * Creates an instance of HttpError
     *
     * @param code Error code
     * @param message Error message
     */
    constructor(code: number, message?: string) {
        super(message)
        Error.captureStackTrace(this, this.constructor)
        this.name = this.constructor.name
        this.code = code
    }

    toJSON() {
        return {
            code: this.code || 500,
            name: this.name || 'Unknown',
            message: this.message
        }
    }
}

export class BadRequest extends HttpError {
    /**
     * Creates an instance of BadRequest
     *
     * @param message Error message
     */
    constructor(message?: string) {
        super(400, message || 'Bad Request')
    }
}

export class Unauthorized extends HttpError {
    /**
     * Creates an instance of Unauthorized
     *
     * @param message Error message
     */
    constructor(message?: string) {
        super(401, message || 'Unauthorized')
    }
}

export class Forbidden extends HttpError {
    /**
     * Creates an instance of Unauthorized
     *
     * @param message Error message
     */
    constructor(message?: string) {
        super(403, message || 'Forbidden')
    }
}

export class NotFound extends HttpError {
    /**
     * Creates an instance of NotFound
     *
     * @param message Error message
     */
    constructor(message?: string) {
        super(404, message || 'Not Found')
    }
}

export class Conflict extends HttpError {
    /**
     * Creates an instance of Conflict
     *
     * @param message Error message
     */
    constructor(message?: string) {
        super(409, message || 'Conflict')
    }
}

export class Expired extends HttpError {
    /**
     * Creates an instance of Expired
     *
     * @param message Error message
     */
    constructor(message?: string) {
        super(410, message || 'Expired')
    }
}

export class NotImplemented extends HttpError {
    /**
     * Creates an instance of NotImplemented
     *
     * @param message Error message
     */
    constructor(message?: string) {
        super(501, message || 'Not Implemented')
    }
}

export class Internal extends HttpError {
    /**
     * Creates an instance of NotImplemented
     *
     * @param message Error message
     */
    constructor(message?: string) {
        super(500, message || 'Internal Error')
    }
}

export class ServiceError extends Error {
    readonly state: number

    /**
     * Creates an instance of HttpError
     *
     * @param service Service instance
     * @param contract Contract
     */
    constructor(service: any, contract: Contract)

    /**
     * Creates an instance of HttpError
     *
     * @param service Service instance
     * @param state Error code
     * @param message Error message
     */
    constructor(service: any, state: number, message: string)

    constructor(service: any, arg1: number | Contract, arg2?: string) {
        let message: string, state: number
        if (typeof arg1 === 'number') {
            state = arg1
            message = arg2
        } else {
            state = arg1.state
            message = arg1.msg
        }
        super(message)
        Error.captureStackTrace(this, this.constructor)
        this.state = state
        this.name = service.constructor.name
    }

    toJSON() {
        return {
            state: this.state,
            name: this.name || 'Unknown',
            message: this.message
        }
    }
}
