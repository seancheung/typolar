"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable:naming-convention
const utils_1 = require("./utils");
/**
 * Model base class
 */
class Model {
    constructor(data) {
        if (data) {
            Object.assign(this, data);
        }
    }
    /**
     * Copy only exising keys into this model
     *
     * @param data Data to copy
     */
    copy(data) {
        Object.assign(this, utils_1.pick(data, this));
    }
    _copy(src, key, ...keys) {
        Object.assign(this, utils_1.pick(src, key, ...keys));
    }
}
exports.Model = Model;
exports.default = Model;
