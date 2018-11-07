"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("./errors");
function required(context, map) {
    return (req, res, next) => {
        try {
            if (!req[context]) {
                throw new errors_1.BadRequest(`missing request ${context}`);
            }
            const missing = Object.keys(map).filter(field => req[context][field] === undefined);
            if (missing.length) {
                throw new errors_1.BadRequest(`${missing
                    .map(field => map[field])
                    .join()} missing in ${context}`);
            }
        }
        catch (error) {
            next(error);
            return;
        }
        next();
    };
}
/**
 * Check required field exists in request body
 *
 * @param map Required fields map with key being the field key and value being the hint value
 */
function body(map) {
    return required('body', map);
}
exports.body = body;
/**
 * Check required field exists in request params
 *
 * @param map Required fields map with key being the field key and value being the hint value
 */
function params(map) {
    return required('params', map);
}
exports.params = params;
/**
 * Check required field exists in request query strings
 *
 * @param map Required fields map with key being the field key and value being the hint value
 */
function queries(map) {
    return required('query', map);
}
exports.queries = queries;
/**
 * Check required field exists in request query strings
 *
 * @param map Required fields map with key being the field key and value being the hint value
 */
function headers(map) {
    return required('headers', map);
}
exports.headers = headers;
/**
 * Success if current running NODE_ENV maches any
 *
 * @param envs Possible envs
 */
function env(...envs) {
    return (req, res, next) => {
        try {
            if (envs.every(e => e !== process.env.NODE_ENV)) {
                throw new errors_1.Forbidden();
            }
            next();
        }
        catch (err) {
            next(err);
        }
    };
}
exports.env = env;
