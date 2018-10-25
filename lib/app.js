"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const config_1 = __importDefault(require("./config"));
const logger_1 = __importDefault(require("./logger"));
const misc_1 = require("./misc");
class Application {
    get express() {
        return this._app;
    }
    get options() {
        return this._options;
    }
    get logger() {
        return this._logger;
    }
    constructor(options) {
        if (!options) {
            options = config_1.default();
        }
        const app = express_1.default();
        misc_1.setup(app, options);
        this._options = options;
        this._logger = logger_1.default('app');
        this._app = app;
    }
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
exports.default = Application;
