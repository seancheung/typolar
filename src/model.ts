// tslint:disable:naming-convention
import 'reflect-metadata'
import { validate } from './utils'

type Props = Map<string | symbol | number, validate>

/**
 * Model base class
 */
export abstract class Model {
    constructor(data?: object) {
        if (data) {
            this.assign(data)
        }
    }

    /**
     * Assign data to this model instance. Only properties decorated with 'prop' will be kept. Validation will be run if found
     *
     * @param data Data to assign
     */
    public assign(data: object): this {
        if (data == null || typeof data !== 'object') {
            throw new Error('Model.assign expects an object argument')
        }
        const props: Props = Reflect.getOwnMetadata(
            prop.METAKEY,
            this.constructor
        )
        if (props) {
            const tmp = {}
            for (const key of Reflect.ownKeys(data)) {
                if (!props.has(key)) {
                    continue
                }
                const value = Reflect.get(data, key)
                const validator = props.get(key)
                if (validator != null && !validate(validator, value)) {
                    throw new prop.ValidationError(key)
                }
                Reflect.set(tmp, key, value)
            }
            Object.assign(this, tmp)
        }

        return this
    }
}

/**
 * Mark a model property
 *
 * @param options Property options
 */
export function prop(options?: validate): PropertyDecorator {
    return function({ constructor }, propertyKey: string | symbol) {
        let ownProps: Props = Reflect.getOwnMetadata(prop.METAKEY, constructor)
        if (!ownProps) {
            const props: Props = Reflect.getMetadata(prop.METAKEY, constructor)
            if (props) {
                ownProps = new Map(props)
            } else {
                ownProps = new Map()
            }
            Reflect.defineMetadata(prop.METAKEY, ownProps, constructor)
        }
        ownProps.set(propertyKey, options)
    }
}
export namespace prop {
    /**
     * Relect metadata key
     */
    export const METAKEY = Symbol()
    /**
     * Prop validation failed error
     */
    export class ValidationError extends Error {
        /**
         * Related property key
         */
        readonly key: string | symbol | number

        /**
         * Creates an instance of ValidationError
         *
         * @param key Property key
         * @param message Error message
         */
        constructor(key: string | symbol | number, message?: string) {
            super(message)
            Error.captureStackTrace(this, this.constructor)
            this.key = key
        }

        toJSON() {
            return {
                key: this.key,
                name: this.name,
                message: this.message
            }
        }
    }
}

export default Model
