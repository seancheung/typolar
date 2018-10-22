import stringcase from 'stringcase'

const dateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/

export function reviver(key: string, value: any) {
    if (value == null) {
        return value
    }
    if (typeof value === 'string' && dateFormat.test(value)) {
        return new Date(value)
    }
    if (Array.isArray(value)) {
        return value
    }
    if (typeof value === 'object') {
        return Object.entries(value).reduce(
            (o, [k, v]) => Object.assign(o, { [stringcase.camelcase(k)]: v }),
            {}
        )
    }
    return value
}

export function replacer(key: string, value: any) {
    if (value == null) {
        return value
    }
    if (value instanceof Date) {
        return value.toJSON()
    }
    if (Array.isArray(value)) {
        return value
    }
    if (typeof value === 'object') {
        return Object.entries(value).reduce(
            (o, [k, v]) => Object.assign(o, { [stringcase.pascalcase(k)]: v }),
            {}
        )
    }
    return value
}

/**
 * Converts a JavaScript Object Notation (JSON) string into an object
 *
 * @param text A valid JSON string
 */
export function parse(text: string) {
    return JSON.parse(text, reviver)
}

/**
 * Converts a JavaScript value to a JavaScript Object Notation (JSON) string
 *
 * @param value A JavaScript value, usually an object or array, to be converted
 */
export function stringify(value: any) {
    return JSON.stringify(value, replacer)
}
