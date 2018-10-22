import bodyParser from 'body-parser'
import express from 'express'
import { createServer, Server } from 'http'
import log4js from 'log4js'
import { NotFound } from './errors'
import getLogger from './logger'
import { logHttp, resolveHost } from './misc'
import { App, Config, Logger, Next, Request, Response } from './types'
import { isDevMode } from './utils'

const symbol = Symbol()

export class Application {
    readonly config: Config
    readonly app: App
    readonly logger: Logger
    get server(): Server {
        return Reflect.get(this, symbol)
    }
    constructor(config: Config) {
        log4js.configure(config.logger)
        this.config = config
        this.logger = getLogger('app')
        this.app = this.create(config)
    }

    create(config: Config): App {
        const app = express()

        /**
         * Use the remote IP address in case nginx reverse proxy enabled
         */
        app.set('trust proxy', true)

        /**
         * body parser
         */
        app.use(bodyParser.json())
        app.use(bodyParser.urlencoded({ extended: false }))

        /**
         * Logger
         */
        logHttp(app, getLogger('morgan'), config.logger.style)

        /**
         * Renderer
         */
        app.set('view engine', config.app.view.engine)

        // TODO: mount

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
            res.json({
                name: err.name,
                error: err.code || 500,
                message: err.message
            })

            // bypass 4xx errors
            if (!err.code || !/^(4[0-9]{2}|503)$/.test(err.code)) {
                this.logger.error(err)
            }
        })

        return app
    }

    async start(): Promise<Server> {
        if (this.server) {
            throw new Error('already started')
        }

        const server = createServer(this.app)
        server.listen(this.config.app.port, this.config.app.host)
        Reflect.set(this, symbol, server)

        process.on('uncaughtException', (err: Error) => {
            this.logger.error('[uncaughtException]', err)
        })

        process.on('unhandledRejection', (reason: any) => {
            this.logger.error('[unhandledRejection]', reason)
        })

        process.on('warning', (warning: Error) => {
            this.logger.warn('[warning]', warning)
        })

        return new Promise<Server>((resolve, reject) => {
            server.on('error', err => {
                const error = err as any
                if (error.syscall === 'listen') {
                    const bind =
                        typeof this.config.app.port === 'string'
                            ? 'Pipe ' + this.config.app.port
                            : 'Port ' + this.config.app.port

                    // handle specific listen errors with friendly messages
                    switch (error.code) {
                        case 'EACCES':
                            this.logger.fatal(
                                `${bind} requires elevated privileges`
                            )
                            break
                        case 'EADDRINUSE':
                            this.logger.fatal(`${bind} is already in use`)
                            break
                        default:
                            this.logger.fatal(err)
                            break
                    }
                } else {
                    this.logger.fatal(err)
                }

                reject(err)
            })

            server.on('listening', () => {
                const addr = server.address()
                const bind =
                    typeof addr === 'string'
                        ? 'pipe ' + addr
                        : 'port ' + addr.port
                if (isDevMode()) {
                    resolveHost(this.config.app.host, this.config.app.port)
                } else {
                    this.logger.info('Listening on ' + bind)
                }
                resolve(server)
            })
        })
    }

    stop(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.server) {
                reject(new Error('not started yet'))
            } else {
                this.server.close(() => resolve())
            }
        })
    }

    exit(code: number) {
        process.exit(code)
    }
}
