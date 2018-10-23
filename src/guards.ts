import {
    Handler,
    Next,
    Request,
    Response
} from './types'

import { BadRequest, Forbidden } from './errors'

/**
 * Check required field exists in request body
 *
 * @param map Required fields map with key being the field key and value being the hint value
 */
export function fields(map: Record<string, string>): Handler {
    return (req: Request, res: Response, next: Next) => {
        const missing = Object.keys(map).filter(
            field => req.body[field] === undefined
        )
        if (!missing.length) {
            return next()
        }
        next(
            new BadRequest(`${missing.map(field => map[field]).join()} missing`)
        )
    }
}

/**
 * Check required field exists in request params
 *
 * @param map Required fields map with key being the field key and value being the hint value
 */
export function params(map: Record<string, string>): Handler {
    return (req: Request, res: Response, next: Next) => {
        const missing = Object.keys(map).filter(
            field => req.params[field] === undefined
        )
        if (!missing.length) {
            return next()
        }
        next(
            new BadRequest(`${missing.map(field => map[field]).join()} missing`)
        )
    }
}

/**
 * Success if current running NODE_ENV maches any
 *
 * @param envs Possible envs
 */
export function env(...envs: string[]) {
    return (req: Request, res: Response, next: Next) => {
        try {
            if (envs.every(e => e !== process.env.NODE_ENV)) {
                throw new Forbidden()
            }
            next()
        } catch (err) {
            next(err)
        }
    }
}