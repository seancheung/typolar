import { Class } from './types'

/**
 * Model base class
 */
export abstract class Model {
    constructor(data?: any) {
        //
    }
}

/**
 * Make a class accpet members assignment in constructor
 */
export function injectable<T extends Class>(ctor: T) {
    return class extends ctor {
        constructor(...args: any[]) {
            super(...args)
            const data = args[0]
            if (data) {
                if (data) {
                    Object.entries(data)
                        .filter(([k, v]) => Reflect.has(this, k))
                        .forEach(([k, v]) => Reflect.set(this, k, v))
                }
            }
        }
    }
}

/**
 * Mark a memebr property as the given type when being injected
 *
 * @param type Property type
 */
export function inject<T extends Class<Model>>(type: T): PropertyDecorator {
    return function func(target: any, key: string | symbol) {
        let value = Reflect.get(target, key)
        Reflect.deleteProperty(target, key)
        Reflect.defineProperty(target, key, {
            enumerable: true,
            configurable: true,
            get(): T {
                return value
            },
            set(v: T) {
                if (v == null) {
                    value = v
                } else {
                    value = new type(v)
                }
            }
        })
    }
}

/**
 * Mark a memebr property as an array of the given type when being injected
 *
 * @param type Property element type
 */
export function injectArray<T extends Class<Model>>(
    type: T
): PropertyDecorator {
    return function func(target: any, key: string | symbol) {
        let value = Reflect.get(target, key)
        Reflect.deleteProperty(target, key)
        Reflect.defineProperty(target, key, {
            enumerable: true,
            configurable: true,
            get(): T {
                return value
            },
            set(v: T[]) {
                if (v == null) {
                    value = v
                } else if (!Array.isArray(v)) {
                    throw new Error('array expected')
                } else {
                    value = v.map((i: any) => (i == null ? i : new type(i)))
                }
            }
        })
    }
}

export default Model
