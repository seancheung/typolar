// tslint:disable:naming-convention
import stringcase from 'stringcase'
import { Class, Conventions, Validator } from './types'

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

/**
 * Validate target value's type
 *
 * @param type Expecting type
 * @param value Value to validate
 */
export function validate(type: Validator, value: any): boolean {
    if (type == null || value == null) {
        return value === type
    }
    if (typeof type === 'function') {
        switch (type) {
            case String:
                return typeof value === 'string'
            case Number:
                return typeof value === 'number'
            case Boolean:
                return typeof value === 'boolean'
            case Array:
                return Array.isArray(value)
            case Object:
                return typeof value === 'object'
            default:
                return (type as Validator.Check)(value)
        }
    }
    if (typeof type === 'object') {
        if (type instanceof RegExp) {
            return typeof value === 'string' && type.test(value)
        }
        if (Array.isArray(type)) {
            if (!Array.isArray(value)) {
                return false
            }
            if (type.length === 1) {
                return value.every(e => validate(type[0], e))
            }
            if (type.length > 1) {
                return value.every((e, i) => type[i] && validate(type[i], e))
            }

            return true
        }
        return Object.keys(type).every(k =>
            validate((type as Validator.ObjectTypes)[k], value[k])
        )
    }

    return false
}

/**
 * Match a sub-template by count then parse it
 *
 * @param template Template string. Variables names start with ':'
 * @param count Items count
 * @param vars Variables
 */
export function localize(
    template: string,
    count: number,
    vars?: Record<string, string>
): string
/**
 * Parse template
 *
 * @param template Template string. Variables names start with ':'
 * @param vars Variables
 */
export function localize(
    template: string,
    vars?: Record<string, string>
): string

export function localize(
    template: string,
    count: number | Record<string, string>,
    vars?: Record<string, string>
): string {
    if (typeof count === 'number') {
        const str = template
            .split(/\|/g)
            .map(g => g.match(/^(?:\{(\d+)\}|\[(?:(\d+),(\d+|\*))\])\s*(.+)/))
            .reduce((s: string, m: RegExpMatchArray) => {
                if (s != null) {
                    return s
                }
                if (!m) {
                    return
                }
                const [, eq, gte, lte, txt] = m
                if (eq !== undefined) {
                    if (isNaN(eq as any)) {
                        return
                    }
                    if (Number(eq) === count) {
                        return txt
                    }
                } else if (gte !== undefined && lte !== undefined) {
                    if (isNaN(gte as any)) {
                        return
                    }
                    if (count < Number(gte)) {
                        return
                    }
                    if (!isNaN(lte as any) && count > Number(lte)) {
                        return
                    }
                    return txt
                }
            }, undefined)
        if (str == null) {
            return template
        }
        vars = { count: count.toString(), ...vars }
        template = str
    } else {
        vars = count
    }
    if (!vars) {
        return template
    }
    return template.replace(/\:(\w+)/g, (_: string, cap: string) => {
        if (cap in vars) {
            return vars[cap]
        }
        return _
    })
}
