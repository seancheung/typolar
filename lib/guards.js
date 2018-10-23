"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("./errors");
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
