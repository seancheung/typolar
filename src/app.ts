import express from 'express'
import config from './config'
import getLogger from './logger'
import { setup, start } from './misc'
import { Config, Express, Hooks, Logger, Server } from './types'

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
     */
    constructor(dirname: string)

    /**
     * Create a new instance of Application
     *
     * @param dirname Application entrypoint directory
     * @param hooks Application hooks
     */
    constructor(dirname: string, hooks: Hooks)

    constructor(dirname: string, hooks?: Hooks) {
        let options: Config
        if (hooks && hooks.beforeLoad) {
            options = hooks.beforeLoad()
        } else {
            options = config()
        }
        const app = express()
        if (hooks && hooks.beforeSetup) {
            hooks.beforeSetup(app)
        }
        setup(dirname, app, options, hooks)
        if (hooks && hooks.afterSetup) {
            hooks.afterSetup(app)
        }
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
