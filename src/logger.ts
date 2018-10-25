import log4js from 'log4js'
import { prettifyTrace } from './misc'
import { Logger } from './types'
import { isDevMode } from './utils'

let initialized: boolean

export default (category?: string): Logger => {
    if (isDevMode() && !initialized) {
        // tslint:disable-next-line:no-var-requires
        const logger: any = require('log4js/lib/logger')
        const wrap = (func: any) => {
            return function(this: Logger, ...args: any[]) {
                args.forEach(arg => {
                    if (arg instanceof Error && arg.stack) {
                        arg.stack = prettifyTrace(arg.stack, true)
                    }
                })
                // tslint:disable-next-line:no-invalid-this
                return func.apply(this, args)
            }
        }
        logger.prototype.error = wrap(logger.prototype.error)
        logger.prototype.warn = wrap(logger.prototype.warn)
        logger.prototype.fatal = wrap(logger.prototype.fatal)
        initialized = true
    }

    return log4js.getLogger(category)
}
