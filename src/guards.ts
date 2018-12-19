import crypto from 'crypto'
import { BadRequest, Forbidden, Unauthorized } from './errors'
import { Handler, Next, Request, Response } from './types'
import { validate } from './utils'

function required(
    context: 'headers' | 'body' | 'params' | 'query',
    fields: string[] | Fields
): Handler {
    if (Array.isArray(fields)) {
        fields = fields.reduce((t, k) => Object.assign(t, { [k]: k }), {})
    }

    return (req, res, next) => {
        try {
            if (!req[context]) {
                throw new BadRequest(`Missing request ${context}`)
            }
            const get =
                typeof req[context] === 'function'
                    ? (k: string) => req[context](k)
                    : (k: string) => req[context][k]
            for (const [key, type] of Object.entries(fields)) {
                const value = get(key)
                if (typeof type === 'string') {
                    if (value !== undefined) {
                        continue
                    }
                    throw new BadRequest(
                        `${type} is required but missing in ${context}`
                    )
                }
                const opt: FiledOptions = type as any
                if (opt.validator || opt.message !== undefined) {
                    if (opt.optional && value === undefined) {
                        continue
                    }
                    if (opt.validator) {
                        if (validate(opt.validator, value)) {
                            continue
                        }
                        if (opt.message !== undefined) {
                            throw new BadRequest(opt.message)
                        }
                        throw new BadRequest(`Invalid ${key} in ${context}`)
                    }
                    if (value !== undefined) {
                        continue
                    }
                    if (opt.message !== undefined) {
                        throw new BadRequest(opt.message)
                    }
                    throw new BadRequest(`Invalid ${key} in ${context}`)
                }
                if (validate(type as validate, value)) {
                    continue
                }
                throw new BadRequest(`Invalid ${key} in ${context}`)
            }
        } catch (error) {
            return next(error)
        }
        next()
    }
}

/**
 * Check required field exists in request body
 *
 * @param fields Required fields array
 * @throws {BadRequest}
 */
export function body(fields: string[]): Handler
/**
 * Check required field exists in request body
 *
 * @param map Required fields map with key being the field key and value being the hint value, validator or field option
 * @throws {BadRequest}
 */
export function body(fields: Fields): Handler
export function body(fields: any): Handler {
    return required('body', fields)
}

/**
 * Check required field exists in request params
 *
 * @param fields Required fields array
 * @throws {BadRequest}
 */
export function params(fields: string[]): Handler
/**
 * Check required field exists in request params
 *
 * @param map Required fields map with key being the field key and value being the hint value, validator or field option
 * @throws {BadRequest}
 */
export function params(fields: Fields): Handler
export function params(fields: any): Handler {
    return required('params', fields)
}

/**
 * Check required field exists in request queries
 *
 * @param fields Required fields array
 * @throws {BadRequest}
 */
export function queries(fields: string[]): Handler
/**
 * Check required field exists in request queries
 *
 * @param map Required fields map with key being the field key and value being the hint value, validator or field option
 * @throws {BadRequest}
 */
export function queries(fields: Fields): Handler
export function queries(fields: any): Handler {
    return required('query', fields)
}

/**
 * Check required field exists in request headers
 *
 * @param fields Required fields array
 * @throws {BadRequest}
 */
export function headers(fields: string[]): Handler
/**
 * Check required field exists in request headers
 *
 * @param map Required fields map with key being the field key and value being the hint value, validator or field option
 * @throws {BadRequest}
 */
export function headers(fields: Fields): Handler
export function headers(fields: any): Handler {
    return required('headers', fields)
}

/**
 * Success if current running NODE_ENV maches any
 *
 * @param envs Envs to match against
 * @throws {Forbidden}
 */
export function env(...envs: string[]): Handler {
    return (req: Request, res: Response, next: Next) => {
        try {
            if (envs.every(e => e !== process.env.NODE_ENV)) {
                throw new Forbidden()
            }
        } catch (err) {
            return next(err)
        }
        next()
    }
}

/**
 * Extract user entity from request
 *
 * @param expand Token expander
 * @throws {Unauthorized}
 */
export function auth<T = any>(expand: (req: Request) => T): Handler {
    return async (req: Request, res: Response, next: Next) => {
        try {
            if (!process.env.SKIP_AUTH) {
                req.$user = await expand(req)
                if (!req.$user) {
                    throw new Unauthorized()
                }
            }
        } catch (err) {
            return next(err)
        }
        next()
    }
}

/**
 * Parse pagination options from query string
 *
 * @param options Pagination options
 * @throws {BadRequest} Invalid pagination arguments
 */
export function pagination(options?: Pagination): Handler {
    const {
        indexName = 'i',
        sizeName = 's',
        maxSize = 200,
        minSize = 5,
        defaultSize = 20
    } = options || {}
    return (req: Request, res: Response, next: Next) => {
        try {
            let page, size
            if (req.query) {
                const index = req.query[indexName] || 0
                const limit = req.query[sizeName] || defaultSize
                if (
                    Number.isNaN(index) ||
                    index < 0 ||
                    Number.isNaN(limit) ||
                    limit < minSize ||
                    limit > maxSize
                ) {
                    throw new BadRequest('Invalid pagination arguments')
                }
                page = Number(index)
                size = Number(limit)
            } else {
                page = 0
                size = defaultSize
            }
            req.$options = Object.assign({}, req.$options, {
                offset: size * page,
                limit: size,
                index: page
            })
        } catch (err) {
            return next(err)
        }
        next()
    }
}

/**
 * Parse filter options from query string
 *
 * @param options Filter options
 * @throws {BadRequest} Invalid filter expression
 */
export function filter(options?: Filter): Handler {
    const { filterName = 'w' } = options || {}
    return (req: Request, res: Response, next: Next) => {
        try {
            if (req.query && req.query[filterName]) {
                let where
                if (typeof req.query[filterName] === 'object') {
                    where = req.query[filterName]
                } else if (typeof req.query[filterName] === 'string') {
                    try {
                        where = JSON.parse(req.query[filterName])
                    } catch (err) {
                        throw new BadRequest('Invalid filter expression')
                    }
                } else {
                    throw new BadRequest('Invalid filter expression')
                }
                req.$options = Object.assign({}, req.$options, {
                    where
                })
            }
        } catch (err) {
            return next(err)
        }
        next()
    }
}

/**
 * Parse sort options from query string
 *
 * @param options Sort options
 * @throws {BadRequest} Invalid sort expression
 */
export function sort(options?: Sort): Handler {
    const { sortName = 'o' } = options || {}
    return (req: Request, res: Response, next: Next) => {
        try {
            if (req.query && req.query[sortName]) {
                let order
                if (typeof req.query[sortName] === 'object') {
                    order = req.query[sortName]
                } else if (typeof req.query[sortName] === 'string') {
                    try {
                        order = JSON.parse(req.query[sortName])
                    } catch (err) {
                        throw new BadRequest('Invalid sort expression')
                    }
                } else {
                    throw new BadRequest('Invalid sort expression')
                }
                req.$options = Object.assign({}, req.$options, {
                    order
                })
            }
        } catch (err) {
            return next(err)
        }
        next()
    }
}

/**
 * Parse projection options from query string
 *
 * @param options Projection options
 * @throws {BadRequest} Invalid projection expression
 */
export function projection(options?: Projection): Handler {
    const { projectionName = 'p' } = options || {}
    return (req: Request, res: Response, next: Next) => {
        try {
            if (req.query && req.query[projectionName]) {
                let select
                if (Array.isArray(req.query[projectionName])) {
                    select = req.query[projectionName]
                } else if (typeof req.query[projectionName] === 'string') {
                    try {
                        select = JSON.parse(req.query[projectionName])
                    } catch (error) {
                        throw new BadRequest('Invalid projection expression')
                    }
                } else {
                    throw new BadRequest('Invalid projection expression')
                }
                req.$options = Object.assign(req.$options || {}, { select })
            }
        } catch (err) {
            return next(err)
        }
        next()
    }
}

/**
 * Check authorization header.
 * The underlying hash checking strategy is:
 * @example namespace + key + ':' + sha1(secret, method + body? md5(json(body), 'hex') : '' + headers['Content-Type'] + url(pathname + search), 'base64')
 *
 * @param options Access options
 * @throws {Unauthorized}
 */
export function access(options: Access): Handler {
    const { namespace, key, secret } = options
    return (req: Request, res: Response, next: Next) => {
        try {
            if (!process.env.SKIP_AUTH) {
                const header = req.header('authorization')
                if (!header || !header.startsWith(namespace + key + ':')) {
                    throw new Unauthorized()
                }
                const md5 =
                    req.body != null
                        ? crypto
                              .createHash('md5')
                              .update(JSON.stringify(req.body))
                              .digest('hex')
                        : ''
                const sha1 = crypto
                    .createHmac('sha1', secret)
                    .update(
                        req.method +
                            md5 +
                            req.header('content-type') +
                            req.originalUrl
                    )
                    .digest('base64')
                const calc = namespace + key + ':' + sha1
                if (calc !== header) {
                    throw new Unauthorized()
                }
            }
        } catch (err) {
            return next(err)
        }
        next()
    }
}

export interface FiledOptions {
    /**
     * Custom validator
     */
    validator?: validate
    /**
     * Custom error message
     */
    message?: string
    /**
     * Field can be omitted
     */
    optional?: boolean
}
export type Field =
    | string
    | Exclude<validate, validate.ObjectTypes>
    | FiledOptions
export type Fields = Record<string, Field>
export interface Pagination {
    /**
     * Page index query string name
     * @default 'i'
     */
    indexName?: string
    /**
     * Page size query string name
     * @default 's'
     */
    sizeName?: string
    /**
     * Page max size
     * @default 200
     */
    maxSize?: number
    /**
     * Page min size
     * @default 5
     */
    minSize?: number
    /**
     * Page default size
     * @default 20
     */
    defaultSize?: number
}
export interface Filter {
    /**
     * Filter query string name
     * @default 'w'
     */
    filterName?: string
}
export interface Sort {
    /**
     * Sort query string name
     * @default 'o'
     */
    sortName?: string
}
export interface Projection {
    /**
     * Projection query string name
     * @default 'p'
     */
    projectionName?: string
}
export interface Access {
    /**
     * Signing namespace
     */
    namespace: string
    /**
     * Signing key
     */
    key: string
    /**
     * Signing secret
     */
    secret: string
}
