"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const config_1 = __importDefault(require("./config"));
const errors_1 = require("./errors");
const logger_1 = __importDefault(require("./logger"));
const misc_1 = require("./misc");
const app = express_1.default();
app.set('trust proxy', true);
const logger = logger_1.default('app');
misc_1.logHttp(app, logger_1.default('morgan'), config_1.default.logger.http.style);
app.set('logger', logger);
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.set('view engine', config_1.default.app.view.engine);
app.set('views', config_1.default.app.view.path);
misc_1.mountRoutes(app, config_1.default.app);
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
process.on('uncaughtException', (err) => {
    logger.error('[uncaughtException]', err);
});
process.on('unhandledRejection', (reason) => {
    logger.error('[unhandledRejection]', reason);
});
process.on('warning', (warning) => {
    logger.warn('[warning]', warning);
});
exports.default = app;
