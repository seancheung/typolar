import { logger } from './logger'
import { Handler, Logger, Middleware, Router } from './types'

const META = Symbol('metadata')
type MixedDecorator = any

interface Meta {
    name?: string
    method?: string
    middlewares?: Middleware
}
interface Route {
    method: string
    url: string
    handler: Handler
    middlewares: Middleware
}
type Transform = (route: Route) => void

function wrap(handler: Handler): Handler {
    return async (req, res, next) => {
        try {
            await handler(req, res, next)
        } catch (error) {
            next(error)
        }
    }
}

/**
 * Controller base class
 */
export abstract class Controller {
    @logger()
    protected readonly _logger: Logger
}

export function* boot(
    router: Router,
    instances: Controller[],
    trasnform?: Transform
) {
    for (const instance of instances) {
        const meta: Record<string, Meta> = Reflect.get(instance, META)
        if (!meta) {
            continue
        }
        const base: Meta = meta.$ctor || {}
        delete meta.$ctor
        for (const key in meta) {
            const handler = Reflect.get(instance, key)
            if (typeof handler !== 'function') {
                continue
            }
            const method = meta[key].method || base.method || 'get'
            const name = `/${base.name || '/'}/${meta[key].name || '/'}`
            const middlewares = (base.middlewares || []).concat(
                meta[key].middlewares || []
            )
            const url = name.replace(/\/{2,}/g, '/').replace(/(.+)\/$/, '$1')

            const func = Reflect.get(router, method.toLowerCase())
            if (!func) {
                throw new Error(`method ${method} not found in router`)
            }
            const opts = { method, url, handler, middlewares }
            if (trasnform) {
                trasnform(opts)
            }
            Reflect.apply(func, router, [
                opts.url,
                ...opts.middlewares,
                wrap(opts.handler.bind(instance))
            ])
            yield { method: opts.method, url: opts.url }
        }
        Reflect.deleteProperty(instance, META)
    }
}

/**
 * Mark a controller or its member as a route
 */
export function route(): MixedDecorator
/**
 * Mark a controller or its member as a route
 *
 * @param name Route name
 * @description When used on a Controller, it's like baseUrl
 */
export function route(name: string): MixedDecorator
/**
 * Mark a controller or one of its member as a route
 *
 * @param middlewares Middlewares
 * @description When used on a Controller, they'll be inserted to each member
 */
export function route(middlewares: Middleware): MixedDecorator
/**
 * Mark a controller or one of its member as a route
 *
 * @param name Route name
 * @param method Route method
 * @description When used on a Controller, name works like baseUrl and method becomes the default method for each member
 */
export function route(name: string, method: string): MixedDecorator
/**
 * Mark a controller or one of its member as a route
 *
 * @param name Route name
 * @param middlewares Middlewares
 * @description When used on a Controller, name works like baseUrl and middlewares will be inserted to each member
 */
export function route(name: string, middlewares: Middleware): MixedDecorator
/**
 * Mark a controller or one of its member as a route
 *
 * @param middlewares Middlewares
 * @param method Route method
 * @description When used on a Controller, middlewares will be inserted to each member and method becomes the default method for each member
 */
export function route(middlewares: Middleware, method: string): MixedDecorator
/**
 * Mark a controller or one of its member as a route
 *
 * @param name Route name
 * @param method Route method
 * @param middlewares Middlewares
 * @description When used on a Controller, name works like baseUrl, method becomes the default method for each member and middlewares will be inserted to each member
 */
export function route(
    name: string,
    method: string,
    middlewares: Middleware
): MixedDecorator
export function route(
    name?: string | Middleware,
    method?: string | Middleware,
    middlewares?: Middleware
): MixedDecorator {
    return function(target: any, prop: string | symbol) {
        let key
        if (typeof target === 'function') {
            // class decorator
            key = '$ctor'
            prop = target.name.replace(/(.+)controller$/i, '$1')
            Object.seal(target)
            Object.seal(target.prototype)
            target = target.prototype
        } else {
            key = prop
        }
        if (typeof prop === 'symbol') {
            return
        }
        if (name == null) {
            name = prop
        } else if (typeof name !== 'string') {
            middlewares = name
            name = prop
        } else if (typeof method !== 'string') {
            middlewares = method
            method = undefined
        }
        const value = { name, method, middlewares }
        if (!Reflect.has(target, META)) {
            Reflect.set(target, META, {})
        }
        const metadata = Reflect.get(target, META)
        Object.assign(metadata, { [key]: value })
    }
}

export default Controller
