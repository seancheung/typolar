"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stringcase_1 = __importDefault(require("stringcase"));
/**
 * Check if running in dev mode
 */
function isDevMode() {
    return process.env.NODE_ENV !== 'production';
}
exports.isDevMode = isDevMode;
/**
 * Apply a trait/mixin to a class
 *
 * @param trait Mixin trait to apply with
 */
function mixin(trait) {
    return (ctor) => {
        Object.getOwnPropertyNames(trait.prototype).forEach(name => {
            ctor.prototype[name] = trait.prototype[name];
        });
    };
}
exports.mixin = mixin;
/**
 * Make a deep cloned copy of target object
 *
 * @param obj Object to clone
 */
function deepClone(obj) {
    return obj != null ? JSON.parse(JSON.stringify(obj)) : obj;
}
exports.deepClone = deepClone;
/**
 * Join urls
 *
 * @param urls urls
 */
function joinUrls(...urls) {
    return urls
        .join('/')
        .replace(/\/{2,}/g, '/')
        .replace(/\/$/, '');
}
exports.joinUrls = joinUrls;
/**
 * Transform url string by the given styles
 *
 * @param url Original url string
 * @param styles stringcase transform style
 */
function transformUrl(url, style) {
    return url
        .split('/')
        .map(p => (/^\:/.test(p) ? p : stringcase_1.default[style](p)))
        .join('/');
}
exports.transformUrl = transformUrl;
