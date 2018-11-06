"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("./errors");
/**
 * Check required field exists in request body
 *
 * @param map Required fields map with key being the field key and value being the hint value
 */
function fields(map) {
    return (req, res, next) => {
        const missing = Object.keys(map).filter(field => req.body[field] === undefined);
        if (!missing.length) {
            return next();
        }
        next(new errors_1.BadRequest(`${missing.map(field => map[field]).join()} missing`));
    };
}
exports.fields = fields;
/**
 * Check required field exists in request params
 *
 * @param map Required fields map with key being the field key and value being the hint value
 */
function params(map) {
    return (req, res, next) => {
        const missing = Object.keys(map).filter(field => req.params[field] === undefined);
        if (!missing.length) {
            return next();
        }
        next(new errors_1.BadRequest(`${missing.map(field => map[field]).join()} missing`));
    };
}
exports.params = params;
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
