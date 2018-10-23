import bodyParser from 'body-parser'
import express from 'express'
import config from './config'
import { NotFound } from './errors'
import getLogger from './logger'
import { logHttp, mountRoutes } from './misc'
import { Next, Request, Response } from './types'

const app = express()

/**
 * Use the remote IP address in case nginx reverse proxy enabled
 */
app.set('trust proxy', true)

/**
 * Logger
 */
const logger = getLogger('app')
logHttp(app, getLogger('morgan'), config.logger.http.style)
app.set('logger', logger)

/**
 * body parser
 */
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

/**
 * Renderer
 */
app.set('view engine', config.app.view.engine)
app.set('views', config.app.view.path)

/**
 * mount router
 */
mountRoutes(app, config.app)

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
    res.json({
        name: err.name,
        error: err.code || 500,
        message: err.message
    })

    // bypass 4xx errors
    if (!err.code || !/^(4[0-9]{2}|503)$/.test(err.code)) {
        logger.error(err)
    }
})

process.on('uncaughtException', (err: Error) => {
    logger.error('[uncaughtException]', err)
})

process.on('unhandledRejection', (reason: any) => {
    logger.error('[unhandledRejection]', reason)
})

process.on('warning', (warning: Error) => {
    logger.warn('[warning]', warning)
})

export = app
