"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const logger_1 = __importDefault(require("./logger"));
const misc_1 = require("./misc");
class Application {
    /**
     * Internal express instance
     */
    get express() {
        return this._app;
    }
    /**
     * Options
     */
    get options() {
        return this._options;
    }
    /**
     * Logger
     */
    get logger() {
        return this._logger;
    }
    constructor(dirname, hooks) {
        let options;
        if (hooks && hooks.beforeLoad) {
            options = hooks.beforeLoad();
        }
        else {
            options = require('./config').default;
        }
        const app = express_1.default();
        if (hooks && hooks.beforeSetup) {
            hooks.beforeSetup(app);
        }
        misc_1.setup(dirname, app, options, hooks);
        if (hooks && hooks.afterSetup) {
            hooks.afterSetup(app);
        }
        this._options = options;
        this._logger = logger_1.default('app');
        this._app = app;
    }
    /**
     * Start listening
     */
    start() {
        if (this._server) {
            return this._server;
        }
        process.on('uncaughtException', (err) => {
            this._logger.error('[uncaughtException]', err);
        });
        process.on('unhandledRejection', (reason) => {
            this._logger.error('[unhandledRejection]', reason);
        });
        process.on('warning', (warning) => {
            this._logger.warn('[warning]', warning);
        });
        const server = misc_1.start(this._app, this._options.app);
        this._server = server;
        return server;
    }
}
exports.Application = Application;
exports.default = Application;
