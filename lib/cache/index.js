"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("../config"));
const client_1 = require("./client");
let cache;
exports.cache = cache;
switch (config_1.default.cache.driver) {
    case ':memory:':
        exports.cache = cache = new client_1.Memory();
        break;
    case 'memcached':
        {
            // tslint:disable-next-line:no-var-requires
            const driver = require(require.resolve(config_1.default.cache.lib, {
                paths: [process.cwd()]
            })).createClient(config_1.default.cache.port, config_1.default.cache.host, config_1.default.cache);
            if (!driver.close) {
                driver.close = driver.end;
            }
            exports.cache = cache = new client_1.Memcached(driver, config_1.default.cache.prefix);
        }
        break;
    default:
        throw new Error('unknown driver type');
}
exports.default = cache;
