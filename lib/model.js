"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Model base class
 */
class Model {
    constructor(data) {
        if (data) {
            Object.assign(this, data);
        }
    }
}
exports.Model = Model;
exports.default = Model;
