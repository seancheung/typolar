"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = require("express");
const fs_1 = __importDefault(require("fs"));
const http_1 = require("http");
const log4js_1 = __importDefault(require("log4js"));
const morgan_1 = __importDefault(require("morgan"));
const os_1 = require("os");
const path_1 = __importDefault(require("path"));
const controller_1 = require("./controller");
const errors_1 = require("./errors");
const logger_1 = __importDefault(require("./logger"));
const utils_1 = require("./utils");
function logHttp(app, logger, style) {
    app.use(morgan_1.default(style, {
        stream: {
            write(str) {
                logger.debug(str);
            }
        },
        skip(req, res) {
            return res.statusCode >= 400;
        }
    }));
    app.use(morgan_1.default(style, {
        stream: {
            write(str) {
                logger.warn(str);
            }
        },
        skip(req, res) {
            return res.statusCode < 400 || res.statusCode >= 500;
        }
    }));
}
exports.logHttp = logHttp;
function resolveHost(host, port) {
    const ifaces = os_1.networkInterfaces();
    host = host === '0.0.0.0' ? '127.0.0.1' : host;
    console.info('\x1b[33m%s\x1b[0m', 'Listening on:');
    if (host && host !== '0.0.0.0') {
        console.info('\x1b[32m%s\x1b[0m', `http://${host}:${port}`);
    }
    else {
        Object.values(ifaces).forEach(info => info.forEach(details => {
            if (details.family === 'IPv4') {
                console.info('\x1b[32m%s\x1b[0m', `http://${details.address}:${port}`);
            }
        }));
    }
    console.log('\x1b[33m%s\x1b[0m', 'Hit CTRL-C to stop the server');
}
exports.resolveHost = resolveHost;
function prettifyTrace(stack, shorten) {
    const extractPathRegex = /\s+at.*(?:\(|\s)(.*)\)?/;
    const pathRegex = /^(?:(?:(?:node|(?:internal\/[\w/]*|.*node_modules\/babel-polyfill\/.*)?\w+)\.js:\d+:\d+)|native)/;
    const cwd = process.cwd().replace(/\\/g, '/') + '/';
    return stack
        .replace(/\\/g, '/')
        .split('\n')
        .filter(x => {
        const pathMatches = x.match(extractPathRegex);
        if (pathMatches === null || !pathMatches[1]) {
            return true;
        }
        const match = pathMatches[1];
        return !pathRegex.test(match);
    })
        .filter(x => x.trim() !== '')
        .map(x => {
        if (shorten) {
            return x.replace(extractPathRegex, (m, p1) => m.replace(p1, p1.replace(cwd, '')));
        }
        return x;
    })
        .join('\n');
}
exports.prettifyTrace = prettifyTrace;
function loadRoutes(dir, style) {
    const logger = logger_1.default('router');
    const router = express_1.Router();
    const controllers = fs_1.default
        .readdirSync(dir)
        .filter(f => /.(j|t)s$/.test(f))
        .map(f => path_1.default.resolve(dir, f))
        .map(file => {
        if (file === __filename) {
            return;
        }
        let item = require(file);
        if (!item) {
            return;
        }
        if (item.default) {
            item = item.default;
        }
        if (typeof item === 'function') {
            item = new item();
        }
        return item;
    })
        .filter(item => item instanceof controller_1.Controller);
    const routes = controller_1.boot(router, controllers, route => {
        if (style) {
            route.url = utils_1.transformUrl(route.url, style);
        }
    });
    for (const route of routes) {
        logger.debug(`mounted route ${route.method.toUpperCase()} ${route.url}`);
    }
    return router;
}
exports.loadRoutes = loadRoutes;
function mountRoutes(app, config) {
    const router = loadRoutes(config.path, config.style);
    let { baseUrl } = config;
    if (baseUrl && config.style) {
        baseUrl = utils_1.transformUrl(baseUrl, config.style);
    }
    if (process.env.NODE_ENV === 'development') {
        if (config.mock) {
            let filepath = config.mock;
            if (!path_1.default.isAbsolute(filepath)) {
                filepath = path_1.default.resolve(process.cwd(), filepath);
            }
            if (fs_1.default.existsSync(filepath)) {
                const logger = logger_1.default('mockit');
                const mockit = require(require.resolve('mockit-express', {
                    paths: [process.cwd()]
                }));
                router.use(mockit(filepath, (err, changed) => {
                    if (err) {
                        logger.error(err);
                    }
                    else if (changed) {
                        logger.info('file changed:', filepath);
                    }
                    else {
                        logger.warn('file removed:', filepath);
                    }
                }, (route) => {
                    logger.debug(`${route.bypass ? 'bypassed' : 'mounted'} ${route.proxy ? 'proxy ' : ''}route ${route.method} ${route.url}`);
                }));
            }
            else {
                console.warn('mock file defined but not found');
            }
        }
    }
    if (baseUrl) {
        app.use(baseUrl, router);
    }
    else {
        app.use(router);
    }
}
exports.mountRoutes = mountRoutes;
function setup(app, config) {
    app.set('trust proxy', true);
    log4js_1.default.configure(config.logger);
    logHttp(app, logger_1.default('morgan'), config.logger.http.style);
    const logger = logger_1.default('app');
    app.use(body_parser_1.default.json());
    app.use(body_parser_1.default.urlencoded({ extended: false }));
    if (config.app.view) {
        app.engine(config.app.view.engine, require(require.resolve(config.app.view.engine, {
            paths: [process.cwd()]
        })).__express);
        app.set('view engine', config.app.view.engine);
        app.set('views', config.app.view.path);
    }
    if (config.app.router) {
        mountRoutes(app, config.app.router);
    }
    app.use((req, res, next) => {
        next(new errors_1.NotFound());
    });
    app.use((err, req, res, next) => {
        res.status(err.code || 500);
        res.json({
            name: err.name,
            error: err.code || 500,
            message: err.message
        });
        if (!err.code || !/^(4[0-9]{2}|503)$/.test(err.code)) {
            logger.error(err);
        }
    });
}
exports.setup = setup;
function start(app, config) {
    const server = http_1.createServer(app);
    const logger = logger_1.default('server');
    server.on('error', err => {
        const error = err;
        if (error.syscall === 'listen') {
            const bind = typeof config.port === 'string'
                ? 'Pipe ' + config.port
                : 'Port ' + config.port;
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
            resolveHost(config.host, config.port);
        }
        else {
            logger.info('Listening on ' + bind);
        }
    });
    server.listen(config.port, config.host);
    return server;
}
exports.start = start;
