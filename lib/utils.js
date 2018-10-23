"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stringcase_1 = __importDefault(require("stringcase"));
function isDevMode() {
    return process.env.NODE_ENV !== 'production';
}
exports.isDevMode = isDevMode;
function mixin(trait) {
    return (ctor) => {
        Object.getOwnPropertyNames(trait.prototype).forEach(name => {
            ctor.prototype[name] = trait.prototype[name];
        });
    };
}
exports.mixin = mixin;
function deepClone(obj) {
    return obj != null ? JSON.parse(JSON.stringify(obj)) : obj;
}
exports.deepClone = deepClone;
function joinUrls(...urls) {
    return urls
        .join('/')
        .replace(/\/{2,}/g, '/')
        .replace(/\/$/, '');
}
exports.joinUrls = joinUrls;
function transformUrl(url, style) {
    return url
        .split('/')
        .map(p => (/^\:/.test(p) ? p : stringcase_1.default[style](p)))
        .join('/');
}
exports.transformUrl = transformUrl;
