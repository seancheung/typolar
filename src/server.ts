import { createServer } from 'http'
import app from './app'
import config from './config'
import getLogger from './logger'
import { resolveHost } from './misc'
import { isDevMode } from './utils'

const server = createServer(app)
const logger = getLogger('server')

server.on('error', err => {
    const error = err as any
    if (error.syscall === 'listen') {
        const bind =
            typeof config.app.port === 'string'
                ? 'Pipe ' + config.app.port
                : 'Port ' + config.app.port

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
    const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port
    if (isDevMode()) {
        resolveHost(config.app.host, config.app.port)
    } else {
        logger.info('Listening on ' + bind)
    }
})

server.listen(config.app.port, config.app.host)

export default server
