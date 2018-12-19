import express from 'express'
import fs from 'fs'
import { Server } from 'http'
import { Config } from 'kuconfig'
import path from 'path'
import { inject, ioc } from './ioc'
import { logger } from './logger'
import { setup, start } from './misc'
import { Express, Logger } from './types'

function resolvePath(dirname: string) {
    if (path.isAbsolute(dirname)) {
        return dirname
    }
    let dir = dirname
    dir = path.resolve(process.cwd(), dir)
    if (fs.existsSync(dir)) {
        return dir
    }
    dir = path.resolve(path.dirname(process.mainModule.filename), dirname)
    if (fs.existsSync(dir)) {
        return dir
    }
    dir = path.resolve(path.dirname(module.parent.filename), dirname)
    if (fs.existsSync(dir)) {
        return dir
    }
    dir = path.resolve(path.dirname(module.parent.parent.filename), dirname)
    if (fs.existsSync(dir)) {
        return dir
    }
    return dirname
}

export class Application {
    /**
     * Internal express instance
     */
    get express(): Express {
        return this._app
    }

    /**
     * Logger
     */
    @logger('app')
    readonly logger: Logger

    /**
     * Config
     */
    @inject(':config')
    readonly config: Config

    private _app: Express
    private _options: Config
    private _server: Server

    /**
     * Create a new instance of Application
     *
     * @param options Application options
     */
    constructor(options?: Application.Hooks) {
        const config: Config = require('kuconfig')
        if (config.app.router && config.app.router.path) {
            (config.app.router as any).path = resolvePath(
                config.app.router.path
            )
        }
        if (config.app.view && config.app.view.path) {
            (config.app.view as any).path = resolvePath(config.app.view.path)
        }
        if (config.graphql) {
            if (config.graphql.types) {
                (config.graphql as any).types = resolvePath(
                    config.graphql.types
                )
            }
            if (config.graphql.resolvers) {
                (config.graphql as any).resolvers = resolvePath(
                    config.graphql.resolvers
                )
            }
        }
        ioc(':config', config)
        const app = express()
        if (options.beforeSetup) {
            options.beforeSetup(app)
        }
        setup(app, config, options)
        if (options.afterSetup) {
            options.afterSetup(app)
        }
    }

    /**
     * Start listening
     */
    start(): Server {
        if (this._server) {
            return this._server
        }
        process.on('uncaughtException', (err: Error) => {
            this.logger.error('[uncaughtException]', err)
        })

        process.on('unhandledRejection', (reason: any) => {
            this.logger.error('[unhandledRejection]', reason)
        })

        process.on('warning', (warning: Error) => {
            this.logger.warn('[warning]', warning)
        })
        const server = start(this._app, this._options.app)
        this._server = server
        return server
    }
}

export declare namespace Application {
    type Hooks = Partial<{
        beforeLoad: () => Config
        beforeSetup: (app: Express) => void
        beforeMount: (app: Express) => void
        afterMount: (app: Express) => void
        afterSetup: (app: Express) => void
    }>
}

export default Application
