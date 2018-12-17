// tslint:disable:no-shadowed-variable
const container: Map<string, any> = new Map()

/**
 * Register data by key
 *
 * @param key Data key
 * @param value Data value
 * @see {ioc.mode}
 */
export function ioc(key: string, value: any): void
/**
 * Get data by key
 *
 * @param key Data key
 */
export function ioc<T = any>(key: string): T
export function ioc(key: string, value?: any): any {
    if (value === undefined) {
        return container.get(key)
    }
    if (!container.has(key)) {
        container.set(key, value)
    } else {
        switch (ioc.mode) {
            case ioc.Mode.Overwrite:
                container.set(key, value)
                break
            case ioc.Mode.Reject:
                throw new ioc.DuplicateRegistrationError(key)
        }
    }
}
export namespace ioc {
    /**
     * Registration mode
     */
    export enum Mode {
        /**
         * Ignore new registration if target key already exists
         */
        Ignore,
        /**
         * Throw an Error when processing duplicate registration
         */
        Reject,
        /**
         * Always overwrite on duplicate registration
         */
        Overwrite
    }
    export class DuplicateRegistrationError extends Error {
        /**
         * Data key
         */
        readonly key: string

        /**
         * Creates an instance of DuplicateRegistrationError
         *
         * @param key Data key
         * @param message Error message
         */
        constructor(key: string, message?: string) {
            super(message)
            Error.captureStackTrace(this, this.constructor)
            this.key = key
        }
    }
    /**
     * Registration mode
     */
    export let mode: Mode
    /**
     * Flush all registered data
     */
    export function flush(): void
    /**
     * Flush data by key
     *
     * @param key Data key
     */
    export function flush(key: string): boolean
    export function flush(key?: string): any {
        if (key === undefined) {
            container.clear()
        }
        return container.delete(key)
    }
}

/**
 * Inject data into property by key. Decorated property will be morphed into a lazy getter
 *
 * @param key Data key
 * @param options Options
 */
export function inject(
    key: string,
    options?: inject.Options
): PropertyDecorator {
    return (target: object, propertyKey: string | symbol) => {
        Reflect.defineProperty(target, propertyKey, {
            get() {
                const value = ioc(key)
                // tslint:disable-next-line:no-invalid-this
                Reflect.defineProperty(this, propertyKey, {
                    value,
                    ...options
                })
                return value
            },
            configurable: true,
            enumerable: false
        })
    }
}
export namespace inject {
    export interface Options {
        configurable?: boolean
        enumerable?: boolean
        writable?: boolean
    }
}

export default ioc
