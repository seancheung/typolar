// tslint:disable:no-console
import bodyParser from 'body-parser'
import { Router } from 'express'
import fs from 'fs'
import { createServer } from 'http'
import { Server } from 'http'
import { Config } from 'kuconfig'
import morgan from 'morgan'
import { networkInterfaces } from 'os'
import path from 'path'
import { Conventions } from 'stringcase'
import { boot } from './controller'
import { HttpError, NotFound } from './errors'
import getLogger, { initialize } from './logger'
import { Express, Hooks, Logger, Next, Request, Response } from './types'
import { isDevMode, transformUrl } from './utils'

/**
 * Mount http logging
 *
 * @param app App instance
 * @param morgan Morgan instance
 * @param logger Logger instance
 * @param style log style
 */
export function logHttp(app: Express, logger: Logger, style: string) {
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

type Filter = (filename: string) => boolean

/**
 * Load all modules in a directory
 *
 * @param dir Modules directory
 * @param filter Filter
 */
export function loadModules(dir: string, filter?: RegExp | Filter) {
    let func: Filter
    if (filter instanceof RegExp) {
        func = t => filter.test(t)
    } else if (!filter) {
        func = t => /.(j|t)s$/.test(t)
    } else {
        func = filter
    }
    return fs
        .readdirSync(dir)
        .filter(f => func(f))
        .map(f => path.resolve(dir, f))
        .map(file => {
            let item = require(file)
            if (!item) {
                return
            }
            if (item.default) {
                item = item.default
            }
            return item
        })
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
    const controllers = loadModules(dir).map(item => {
        if (typeof item === 'function') {
            item = new item()
        }
        return item
    })
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
 * @param dirname Application entrypoint directory
 * @param app Express application instance
 * @param config Router config
 */
export function mountRoutes(
    dirname: string,
    app: Express,
    config: Config.App.Router
): Router {
    const router = loadRoutes(path.join(dirname, config.path), config.style)
    let { baseUrl } = config
    if (baseUrl && config.style) {
        baseUrl = transformUrl(baseUrl, config.style)
    }
    if (config.mock) {
        let filepath = config.mock
        if (!path.isAbsolute(filepath)) {
            filepath = path.resolve(process.cwd(), filepath)
        }
        if (fs.existsSync(filepath)) {
            const logger = getLogger('mockit')
            const mockit = require(require.resolve('mockit-express', {
                paths: [process.cwd()]
            }))
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
                    (route: any) => {
                        logger.debug(
                            `${route.bypass ? 'bypassed' : 'mounted'} ${
                                route.proxy ? 'proxy ' : ''
                            }route ${route.method} ${route.url}`
                        )
                    }
                )
            )
        } else {
            // tslint:disable-next-line:no-console
            console.warn('mock file defined but not found')
        }
    }
    if (baseUrl) {
        app.use(baseUrl, router)
    } else {
        app.use(router)
    }
    return router
}

/**
 * Setup application
 *
 * @param dirname Application entrypoint directory
 * @param app Express application instance
 * @param config Config
 * @param hooks Hooks
 */
export function setup(
    dirname: string,
    app: Express,
    config: Config,
    hooks?: Hooks
) {
    /**
     * Use the remote IP address in case nginx reverse proxy enabled
     */
    app.set('trust proxy', true)

    /**
     * Logger
     */
    initialize(config.logger)
    logHttp(app, getLogger('morgan'), config.logger.http.style)

    /**
     * body parser
     */
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: false }))

    if (hooks && hooks.beforeMount) {
        hooks.beforeMount(app)
    }

    /**
     * Renderer
     */
    if (config.app.view) {
        app.engine(
            config.app.view.engine,
            require(require.resolve(config.app.view.engine, {
                paths: [process.cwd()]
            })).__express
        )
        app.set('view engine', config.app.view.engine)
        if (config.app.view.path) {
            app.set('views', config.app.view.path)
        }
    }

    /**
     * mount router
     */
    if (config.app.router) {
        mountRoutes(dirname, app, config.app.router)
    }

    /**
     * mount graphql
     */
    if (config.graphql) {
        require('./graphql').default(dirname, app, config.graphql)
    }

    if (hooks && hooks.afterMount) {
        hooks.afterMount(app)
    }

    /**
     * Error handler
     */
    const logger = getLogger('app')
    handleError(app, logger)
}

/**
 * Mount error handler
 *
 * @param app Express instance
 */
export function handleError(app: Express, logger?: Logger) {
    /**
     * catch 404 and forward to error handler
     */
    app.use((req, res, next) => {
        next(new NotFound())
    })

    /**
     * error handler
     */
    app.use((err: any, req: Request, res: Response, next: Next) => {
        // set http status
        res.status(err.code || 500)

        // send error
        if (err instanceof HttpError) {
            res.json(err)
        } else {
            res.json({
                name: err.name,
                error: err.code || 500,
                message: err.message
            })
        }

        if (logger) {
            // bypass 4xx errors
            if (!err.code || !/^(4[0-9]{2}|503)$/.test(err.code)) {
                logger.error(err)
            }
        }
    })
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
