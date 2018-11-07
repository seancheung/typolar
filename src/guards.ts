import { Handler, Next, Request, Response } from './types'

import { BadRequest, Forbidden } from './errors'

function required(
    context: 'headers' | 'body' | 'params' | 'query',
    map: Record<string, string>
): Handler {
    return (req: Request, res: Response, next: Next) => {
        try {
            if (!req[context]) {
                throw new BadRequest(`missing request ${context}`)
            }
            const missing = Object.keys(map).filter(
                field => req[context][field] === undefined
            )
            if (missing.length) {
                throw new BadRequest(
                    `${missing
                        .map(field => map[field])
                        .join()} missing in ${context}`
                )
            }
        } catch (error) {
            next(error)
            return
        }
        next()
    }
}

/**
 * Check required field exists in request body
 *
 * @param map Required fields map with key being the field key and value being the hint value
 */
export function body(map: Record<string, string>): Handler {
    return required('body', map)
}

/**
 * Check required field exists in request params
 *
 * @param map Required fields map with key being the field key and value being the hint value
 */
export function params(map: Record<string, string>): Handler {
    return required('params', map)
}

/**
 * Check required field exists in request query strings
 *
 * @param map Required fields map with key being the field key and value being the hint value
 */
export function queries(map: Record<string, string>): Handler {
    return required('query', map)
}

/**
 * Check required field exists in request query strings
 *
 * @param map Required fields map with key being the field key and value being the hint value
 */
export function headers(map: Record<string, string>): Handler {
    return required('headers', map)
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
