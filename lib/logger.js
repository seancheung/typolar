"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const log4js_1 = __importDefault(require("log4js"));
const misc_1 = require("./misc");
let initialized;
function initialize(config) {
    if (initialized) {
        return;
    }
    log4js_1.default.configure(config);
    if (config.stack && config.stack.pretty) {
        const logger = require('log4js/lib/logger');
        const wrap = (func) => {
            return function (...args) {
                args.forEach(arg => {
                    if (arg instanceof Error && arg.stack) {
                        arg.stack = misc_1.prettifyTrace(arg.stack, true);
                    }
                });
                // tslint:disable-next-line:no-invalid-this
                return func.apply(this, args);
            };
        };
        logger.prototype.error = wrap(logger.prototype.error);
        logger.prototype.warn = wrap(logger.prototype.warn);
        logger.prototype.fatal = wrap(logger.prototype.fatal);
    }
    initialized = true;
}
exports.initialize = initialize;
exports.default = (category) => {
    return log4js_1.default.getLogger(category);
};
