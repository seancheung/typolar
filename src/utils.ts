import stringcase from 'stringcase'
import { Class, Conventions } from './types'

/**
 * Check if running in dev mode
 */
export function isDevMode() {
    return process.env.NODE_ENV !== 'production'
}

/**
 * Apply a trait/mixin to a class
 *
 * @param trait Mixin trait to apply with
 */
export function mixin<T extends Class>(trait: T) {
    return (ctor: T) => {
        Object.getOwnPropertyNames(trait.prototype).forEach(name => {
            ctor.prototype[name] = trait.prototype[name]
        })
    }
}

/**
 * Make a deep cloned copy of target object
 *
 * @param obj Object to clone
 */
export function deepClone(obj: any) {
    return obj != null ? JSON.parse(JSON.stringify(obj)) : obj
}

/**
 * Join urls
 *
 * @param urls urls
 */
export function joinUrls(...urls: string[]) {
    return urls
        .join('/')
        .replace(/\/{2,}/g, '/')
        .replace(/\/$/, '')
}

/**
 * Transform url string by the given styles
 *
 * @param url Original url string
 * @param styles stringcase transform style
 */
export function transformUrl(url: string, style: Conventions): string {
    return url
        .split('/')
        .map(p => (/^\:/.test(p) ? p : stringcase[style](p)))
        .join('/')
}