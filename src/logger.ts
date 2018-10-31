import log4js from 'log4js'
import config from './config'
import { prettifyTrace } from './misc'
import { Logger } from './types'

let initialized: boolean

export default (category?: string): Logger => {
    if (!initialized) {
        const {
            logger: { stack }
        } = config()
        if (stack && stack.pretty) {
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
        }
        initialized = true
    }

    return log4js.getLogger(category)
}
