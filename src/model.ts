// tslint:disable:naming-convention
import { pick } from './utils'

/**
 * Model base class
 */
export abstract class Model<T extends Model<T> = any> {
    constructor(data?: Partial<T>) {
        if (data) {
            Object.assign(this, data)
        }
    }

    /**
     * Copy only exising keys into this model
     *
     * @param data Data to copy
     */
    copy(data: Partial<T>) {
        Object.assign(this, pick(data, this))
    }

    /**
     * Copy selected keys from source object to this model
     *
     * @param src Source to copy from
     * @param keys Keys to copy
     */
    protected _copy<K extends keyof T>(src: Partial<T>, ...keys: K[]): void

    /**
     * Copy selected keys from source object to this model
     *
     * @param src Source to copy from
     * @param keys Object to copy keys of
     */
    protected _copy<K extends keyof T>(
        src: Partial<T>,
        keys: Record<K, any>
    ): void

    protected _copy<K extends keyof T>(
        src: Partial<T>,
        key: K | Record<K, any>,
        ...keys: K[]
    ): void {
        Object.assign(this, pick(src, key as any, ...keys))
    }
}

export default Model
