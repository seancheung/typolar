import express from 'express'
import config from './config'
import getLogger from './logger'
import { setup, start } from './misc'
import { Config, Express, Logger, Server } from './types'

class Application {
    private _app: Express
    private _options: Config
    private _logger: Logger
    private _server: Server

    /**
     * Internal express instance
     */
    get express(): Express {
        return this._app
    }

    /**
     * Options
     */
    get options(): Readonly<Config> {
        return this._options
    }

    /**
     * Logger
     */
    get logger(): Logger {
        return this._logger
    }

    /**
     * Create a new instance of Application
     *
     * @param dirname Application entrypoint directory
     * @param options Application options
     */
    constructor(dirname: string, options?: Config) {
        if (!options) {
            options = config()
        }
        const app = express()
        setup(dirname, app, options)
        this._options = options
        this._logger = getLogger('app')
        this._app = app
    }

    /**
     * Start listening
     */
    start(): Server {
        if (this._server) {
            return this._server
        }
        process.on('uncaughtException', (err: Error) => {
            this._logger.error('[uncaughtException]', err)
        })

        process.on('unhandledRejection', (reason: any) => {
            this._logger.error('[unhandledRejection]', reason)
        })

        process.on('warning', (warning: Error) => {
            this._logger.warn('[warning]', warning)
        })
        const server = start(this._app, this._options.app)
        this._server = server
        return server
    }
}

export default Application
