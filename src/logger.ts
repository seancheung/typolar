// tslint:disable:no-invalid-this no-shadowed-variable
import { Config } from 'kuconfig'
import log4js from 'log4js'
import stringcase from 'stringcase'
import { prettifyTrace } from './misc'
import { Logger } from './types'

let initialized: boolean

/**
 * Initialize logger
 *
 * @param config Logger config
 */
export function initialize(config: Config.Logger) {
    if (initialized) {
        return
    }
    log4js.configure(config)
    if (config.stack && config.stack.pretty) {
        const logger: any = require('log4js/lib/logger')
        const wrap = (func: any) => {
            return function(this: Logger, ...args: any[]) {
                args.forEach(arg => {
                    if (arg instanceof Error && arg.stack) {
                        arg.stack = prettifyTrace(arg.stack, true)
                    }
                })
                return func.apply(this, args)
            }
        }
        logger.prototype.error = wrap(logger.prototype.error)
        logger.prototype.warn = wrap(logger.prototype.warn)
        logger.prototype.fatal = wrap(logger.prototype.fatal)
    }
    initialized = true
}

/**
 * Inject a logger into property
 *
 * @param category Logger category. If omitted, it'll be its class name in kebacase
 */
export function logger(category?: string): PropertyDecorator {
    return (target: object, propertyKey: string | symbol) => {
        Reflect.defineProperty(target, propertyKey, {
            get() {
                const value = log4js.getLogger(
                    category || stringcase.spinalcase(this.constructor.name)
                )
                Reflect.defineProperty(this, propertyKey, {
                    value
                })
                return value
            },
            configurable: true,
            enumerable: false
        })
    }
}

/**
 * Get a logger
 *
 * @param category Logger category
 */
export function getLogger(category?: string): Logger {
    return log4js.getLogger(category)
}

export default getLogger
