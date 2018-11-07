"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const kuconfig_1 = __importDefault(require("kuconfig"));
function desolve() {
    kuconfig_1.default.__.desolve();
    delete require.cache[__filename];
}
exports.desolve = desolve;
exports.default = kuconfig_1.default;
