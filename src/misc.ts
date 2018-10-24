// tslint:disable:no-console
import { Router } from 'express'
import fs from 'fs'
import { createServer } from 'http'
import morgan from 'morgan'
import { networkInterfaces } from 'os'
import path from 'path'
import { Conventions } from 'stringcase'
import { boot, Controller } from './controller'
import getLogger from './logger'
import { App, Config, Express, Logger, Server } from './types'
import { isDevMode, transformUrl } from './utils'

/**
 * Mount http logging
 *
 * @param app App instance
 * @param morgan Morgan instance
 * @param logger Logger instance
 * @param style log style
 */
export function logHttp(app: App, logger: Logger, style: string) {
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

/**
 * Boot all routes in target directory
 *
 * @param dir Routes directory
 * @param style Url transform style
 */
export function loadRoutes(dir: string, style?: Conventions): Router {
    const logger = getLogger('router')
    const router = Router() as any
    const controllers = fs
        .readdirSync(dir)
        .filter(f => /.(j|t)s$/.test(f))
        .map(f => path.resolve(dir, f))
        .map(file => {
            if (file === __filename) {
                return
            }
            let item = require(file)
            if (!item) {
                return
            }
            if (item.default) {
                item = item.default
            }
            if (typeof item === 'function') {
                item = new item()
            }
            return item
        })
        .filter(item => item instanceof Controller)
    const routes = boot(router, controllers, route => {
        if (style) {
            route.url = transformUrl(route.url, style)
        }
    })
    for (const route of routes) {
        logger.debug(`mounted route ${route.method.toUpperCase()} ${route.url}`)
    }

    return router as Router
}

/**
 * Mount router
 *
 * @param app Express application instance
 * @param config App config
 */
export function mountRoutes(app: App, config: Config.App) {
    const router = loadRoutes(config.router.path, config.router.style)
    const baseUrl = config.router.style
        ? transformUrl(config.router.baseUrl, config.router.style)
        : config.router.baseUrl
    if (process.env.NODE_ENV === 'development') {
        if (config.router.mock) {
            let filepath = config.router.mock
            if (!path.isAbsolute(filepath)) {
                filepath = path.resolve(process.cwd(), filepath)
            }
            if (fs.existsSync(filepath)) {
                const logger = getLogger('mockit')
                import('mockit-express').then(({ default: mockit }) => {
                    router.use(
                        mockit(
                            filepath,
                            (err: Error, changed: boolean) => {
                                if (err) {
                                    logger.error(err)
                                } else if (changed) {
                                    logger.info('file changed:', filepath)
                                } else {
                                    logger.warn('file removed:', filepath)
                                }
                            },
                            ({ method, path: url, proxy, bypass }) => {
                                logger.debug(
                                    `${bypass ? 'bypassed' : 'mounted'} ${
                                        proxy ? 'proxy ' : ''
                                    }route ${method} ${url}`
                                )
                            }
                        )
                    )
                })
            } else {
                // tslint:disable-next-line:no-console
                console.warn('mock file defined but not found')
            }
        }
    }
    app.use(baseUrl, router)
}

export function start(app: Express, config: Config.Server): Server {
    const server = createServer(app)
    const logger = getLogger('server')

    server.on('error', err => {
        const error = err as any
        if (error.syscall === 'listen') {
            const bind =
                typeof config.port === 'string'
                    ? 'Pipe ' + config.port
                    : 'Port ' + config.port

            // handle specific listen errors with friendly messages
            switch (error.code) {
                case 'EACCES':
                    logger.fatal(`${bind} requires elevated privileges`)
                    break
                case 'EADDRINUSE':
                    logger.fatal(`${bind} is already in use`)
                    break
                default:
                    logger.fatal(err)
                    break
            }
        } else {
            logger.fatal(err)
        }

        process.exit(1)
    })

    server.on('listening', () => {
        const addr = server.address()
        const bind =
            typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port
        if (isDevMode()) {
            resolveHost(config.host, config.port)
        } else {
            logger.info('Listening on ' + bind)
        }
    })

    server.listen(config.port, config.host)

    return server
}
