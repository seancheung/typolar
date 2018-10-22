// tslint:disable:no-console
import morgan from 'morgan'
import { networkInterfaces } from 'os'
import { App, Logger } from './types'

/**
 * Mount http logging
 *
 * @param app App instance
 * @param morgan Morgan instance
 * @param logger Logger instance
 * @param style log style
 */
export function logHttp(
    app: App,
    logger: Logger,
    style: string
) {
    app.use(
        morgan(style, {
            stream: {
                write(str) {
                    logger.debug(str)
                }
            },
            skip(req, res) {
                return res.statusCode >= 400
            }
        })
    )
    app.use(
        morgan(style, {
            stream: {
                write(str) {
                    logger.warn(str)
                }
            },
            skip(req, res) {
                return res.statusCode < 400 || res.statusCode >= 500
            }
        })
    )
}

/**
 * Resolve IP address
 *
 * @param config
 */
export function resolveHost(host: string, port: number) {
    const ifaces = networkInterfaces()
    host = host === '0.0.0.0' ? '127.0.0.1' : host

    console.info('\x1b[33m%s\x1b[0m', 'Listening on:')
    if (host && host !== '0.0.0.0') {
        console.info('\x1b[32m%s\x1b[0m', `http://${host}:${port}`)
    } else {
        Object.values(ifaces).forEach(info =>
            info.forEach(details => {
                if (details.family === 'IPv4') {
                    console.info(
                        '\x1b[32m%s\x1b[0m',
                        `http://${details.address}:${port}`
                    )
                }
            })
        )
    }
    console.log('\x1b[33m%s\x1b[0m', 'Hit CTRL-C to stop the server')
}

/**
 * Prettify stack trace
 *
 * @param stack Stack trace
 * @param shorten Cut file path to relative
 */
export function prettifyTrace(stack: string, shorten?: boolean) {
    const extractPathRegex = /\s+at.*(?:\(|\s)(.*)\)?/
    const pathRegex = /^(?:(?:(?:node|(?:internal\/[\w/]*|.*node_modules\/babel-polyfill\/.*)?\w+)\.js:\d+:\d+)|native)/
    const cwd = process.cwd().replace(/\\/g, '/') + '/'
    return stack
        .replace(/\\/g, '/')
        .split('\n')
        .filter(x => {
            const pathMatches = x.match(extractPathRegex)
            if (pathMatches === null || !pathMatches[1]) {
                return true
            }
            const match = pathMatches[1]
            return !pathRegex.test(match)
        })
        .filter(x => x.trim() !== '')
        .map(x => {
            if (shorten) {
                return x.replace(extractPathRegex, (m, p1) =>
                    m.replace(p1, p1.replace(cwd, ''))
                )
            }

            return x
        })
        .join('\n')
}
