"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stringcase_1 = __importDefault(require("stringcase"));
const dateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
function reviver(style, key, value) {
    if (value == null) {
        return value;
    }
    if (typeof value === 'string' && dateFormat.test(value)) {
        return new Date(value);
    }
    if (Array.isArray(value)) {
        return value;
    }
    if (style in stringcase_1.default && typeof value === 'object') {
        return Object.entries(value).reduce((o, [k, v]) => Object.assign(o, { [stringcase_1.default[style](k)]: v }), {});
    }
    return value;
}
exports.reviver = reviver;
function replacer(style, key, value) {
    if (value == null) {
        return value;
    }
    if (value instanceof Date) {
        return value.toJSON();
    }
    if (Array.isArray(value)) {
        return value;
    }
    if (style in stringcase_1.default && typeof value === 'object') {
        return Object.entries(value).reduce((o, [k, v]) => Object.assign(o, { [stringcase_1.default[style](k)]: v }), {});
    }
    return value;
}
exports.replacer = replacer;
function parse(text, style) {
    return JSON.parse(text, reviver.bind(null, style));
}
exports.parse = parse;
function stringify(value, style) {
    return JSON.stringify(value, replacer.bind(null, style));
}
exports.stringify = stringify;
