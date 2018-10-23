import { Handler, Middleware, Router } from './types'

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

export abstract class Controller {}

export function route(): MixedDecorator
export function route(name: string): MixedDecorator
export function route(middlewares: Middleware): MixedDecorator
export function route(name: string, method: string): MixedDecorator
export function route(name: string, middlewares: Middleware): MixedDecorator
export function route(middlewares: Middleware, method: string): MixedDecorator
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
            key = 'constructor'
            prop = target.name
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

export { Response, NextFunction as Next } from 'express'

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
        const base: Meta = meta.constructor || {}
        delete meta.constructor
        for (const key in meta) {
            const handler = Reflect.get(instance, key)
            if (typeof handler !== 'function') {
                continue
            }
            const method = meta[key].method || base.method || 'get'
            const name = `/${base.name || ''}/${meta[key].name || ''}`
            const middlewares = (base.middlewares || []).concat(
                meta[key].middlewares || []
            )
            const url = name.replace(/\/{2,}/g, '/').replace(/\/$/, '')

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
                opts.handler.bind(instance)
            ])
            yield { method: opts.method, url: opts.url }
        }
        Reflect.deleteProperty(instance, META)
    }
}