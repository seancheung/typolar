// tslint:disable:no-shadowed-variable
import { Class } from './types'

const container: Map<Class, any> = new Map()

/**
 * Register a class
 *
 * @param type Class type
 */
export function register<T extends Class>(type: T): boolean

/**
 * Register a class instance
 *
 * @param type Class type
 */
export function register<T extends Class>(
    type: T,
    instance: InstanceType<T>
): boolean
/**
 * Register a class
 */
export function register<T extends Class>(): ClassDecorator

export function register<T extends Class>(
    type?: T,
    instance?: InstanceType<T>
) {
    if (type !== undefined) {
        if (!container.has(type)) {
            if (instance === undefined) {
                instance = new type()
            }
            container.set(type, instance)
            return true
        }
        return false
    }
    return (ctor: T) => {
        if (!container.has(ctor)) {
            container.set(ctor, new ctor())
        }
    }
}

/**
 * Fetch a class instance
 *
 * @param type Class type
 * @param register Auto register if not found
 */
export function fetch<T extends Class>(
    type: T,
    register: false
): InstanceType<T> | void

/**
 * Fetch a class instance
 *
 * @param type Class type
 * @param register Auto register if not found
 */
export function fetch<T extends Class>(
    type: T,
    register?: true
): InstanceType<T>

export function fetch<T extends Class>(
    type: T,
    register?: boolean
): InstanceType<T> | void {
    if (!container.has(type)) {
        if (register === true || register === undefined) {
            container.set(type, new type())
        }
    }
    if (container.has(type)) {
        return container.get(type)
    }
}

/**
 * Flush all registered instances
 */
export function flush<T extends Class>(): void
/**
 * Flush  registered instance of the given type
 */
export function flush<T extends Class>(type: T): boolean
export function flush<T extends Class>(type?: T): boolean | void {
    if (type === undefined) {
        container.clear()
    } else {
        return container.delete(type)
    }
}
