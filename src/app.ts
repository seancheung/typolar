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

    get express(): Express {
        return this._app
    }

    get options(): Config {
        return this._options
    }

    get logger(): Logger {
        return this._logger
    }

    constructor(options?: Config) {
        if (!options) {
            options = config()
        }
        const app = express()
        setup(app, options)
        this._options = options
        this._logger = getLogger('app')
        this._app = app
    }

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
