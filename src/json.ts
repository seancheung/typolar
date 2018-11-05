import stringcase from 'stringcase'
import { Conventions } from './types'

const dateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/

export function transform(style: Conventions, value: any): any {
    if (value == null) {
        return value
    }
    if (Array.isArray(value)) {
        return value.map(i => transform(style, i))
    }
    if (typeof value === 'object') {
        return Object.entries(value).reduce(
            (o, [k, v]) => Object.assign(o, { [stringcase[style](k)]: v }),
            {}
        )
    }
    return value
}

export function reviver(style: Conventions, key: string, value: any) {
    if (value == null) {
        return value
    }
    if (typeof value === 'string' && dateFormat.test(value)) {
        return new Date(value)
    }
    if (Array.isArray(value)) {
        return value
    }
    if (style && style in stringcase && typeof value === 'object') {
        return Object.entries(value).reduce(
            (o, [k, v]) => Object.assign(o, { [stringcase[style](k)]: v }),
            {}
        )
    }
    return value
}

export function replacer(style: Conventions, key: string, value: any) {
    if (value == null) {
        return value
    }
    if (value instanceof Date) {
        return value.toJSON()
    }
    if (Array.isArray(value)) {
        return value
    }
    if (style && style in stringcase && typeof value === 'object') {
        return Object.entries(value).reduce(
            (o, [k, v]) => Object.assign(o, { [stringcase[style](k)]: v }),
            {}
        )
    }
    return value
}

/**
 * Converts a JavaScript Object Notation (JSON) string into an object
 *
 * @param text A valid JSON string
 * @param style Keys convention
 */
export function parse(text: string, style: Conventions) {
    return JSON.parse(text, reviver.bind(null, style))
}

/**
 * Converts a JavaScript value to a JavaScript Object Notation (JSON) string
 *
 * @param value A JavaScript value, usually an object or array, to be converted
 * @param style Keys convention
 */
export function stringify(value: any, style: Conventions) {
    return JSON.stringify(value, replacer.bind(null, style))
}
