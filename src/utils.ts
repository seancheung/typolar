// tslint:disable:naming-convention
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
export function mixin(trait: Class) {
    return (ctor: Class) => {
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
export function deepClone<T>(obj: T): T {
    return obj != null ? JSON.parse(JSON.stringify(obj)) : obj
}

/**
 * Join urls
 *
 * @param urls urls
 */
export function joinUrls(...urls: string[]): string {
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

/**
 * Pick selected keys from source object into a new object
 *
 * @param obj Object to pick from
 * @param keys Properties to pick
 */
export function pick<T, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K>

/**
 * Pick selected keys from source object into a new object
 *
 * @param obj Object to pick from
 * @param keys Object to pick with keys of
 */
export function pick<T, K extends keyof T>(
    obj: T,
    keys: Record<K, any>
): Pick<T, K>

export function pick<T, K extends keyof T>(
    obj: T,
    key: Record<K, any> | K,
    ...keys: K[]
) {
    {
        if (typeof key !== 'string') {
            keys = Object.keys(key) as K[]
        } else {
            keys.unshift(key)
        }
        return Object.keys(obj)
            .filter(k => keys.includes(k as K))
            .reduce(
                (o, k) => Object.assign(o, { [k]: (obj as any)[k] }),
                {}
            ) as any
    }
}

/**
 * Pick keys not selected from source object into a new object
 *
 * @param obj Object to pick from
 * @param keys Properties to exclude
 */
export function strip<T, K extends keyof T>(
    obj: T,
    ...keys: K[]
): Pick<T, Exclude<keyof T, K>>

/**
 * Pick keys not selected from source object into a new object
 *
 * @param obj Object to pick from
 * @param keys Object to exclude keys of
 */
export function strip<T, K extends keyof T>(
    obj: T,
    keys: Record<K, any>
): Pick<T, Exclude<keyof T, K>>

export function strip<T, K extends keyof T>(
    obj: T,
    key: Record<K, any> | K,
    ...keys: K[]
): Pick<T, Exclude<keyof T, K>> {
    if (typeof key !== 'string') {
        keys = Object.keys(key) as K[]
    } else {
        keys.unshift(key)
    }
    return Object.keys(obj)
        .filter(k => !keys.includes(k as K))
        .reduce((o, k) => Object.assign(o, { [k]: (obj as any)[k] }), {}) as any
}
