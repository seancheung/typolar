"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./config"));
const logger_1 = __importDefault(require("./logger"));
const misc_1 = require("./misc");
const utils_1 = require("./utils");
const server = http_1.createServer(app_1.default);
const logger = logger_1.default('server');
server.on('error', err => {
    const error = err;
    if (error.syscall === 'listen') {
        const bind = typeof config_1.default.app.port === 'string'
            ? 'Pipe ' + config_1.default.app.port
            : 'Port ' + config_1.default.app.port;
        switch (error.code) {
            case 'EACCES':
                logger.fatal(`${bind} requires elevated privileges`);
                break;
            case 'EADDRINUSE':
                logger.fatal(`${bind} is already in use`);
                break;
            default:
                logger.fatal(err);
                break;
        }
    }
    else {
        logger.fatal(err);
    }
    process.exit(1);
});
server.on('listening', () => {
    const addr = server.address();
    const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    if (utils_1.isDevMode()) {
        misc_1.resolveHost(config_1.default.app.host, config_1.default.app.port);
    }
    else {
        logger.info('Listening on ' + bind);
    }
});
server.listen(config_1.default.app.port, config_1.default.app.host);
exports.default = server;
