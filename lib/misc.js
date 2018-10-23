"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fs_1 = __importDefault(require("fs"));
const morgan_1 = __importDefault(require("morgan"));
const os_1 = require("os");
const path_1 = __importDefault(require("path"));
const controller_1 = require("./controller");
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
    const routes = controller_1.Controller.boot(router, controllers, route => {
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
    const router = loadRoutes(config.router.path, config.router.style);
    const baseUrl = config.router.style
        ? utils_1.transformUrl(config.router.baseUrl, config.router.style)
        : config.router.baseUrl;
    if (process.env.NODE_ENV === 'development') {
        if (config.router.mock) {
            let filepath = config.router.mock;
            if (!path_1.default.isAbsolute(filepath)) {
                filepath = path_1.default.resolve(process.cwd(), filepath);
            }
            if (fs_1.default.existsSync(filepath)) {
                const logger = logger_1.default('mockit');
                Promise.resolve().then(() => __importStar(require('mockit-express'))).then(({ default: mockit }) => {
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
                    }, ({ method, path: url, proxy, bypass }) => {
                        logger.debug(`${bypass ? 'bypassed' : 'mounted'} ${proxy ? 'proxy ' : ''}route ${method} ${url}`);
                    }));
                });
            }
            else {
                console.warn('mock file defined but not found');
            }
        }
    }
    app.use(baseUrl, router);
}
exports.mountRoutes = mountRoutes;
