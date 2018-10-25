"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stringcase_1 = __importDefault(require("stringcase"));
const logger_1 = __importDefault(require("./logger"));
const META = Symbol('metadata');
class Controller {
    constructor() {
        this._logger = logger_1.default(stringcase_1.default.spinalcase(this.constructor.name));
    }
}
exports.Controller = Controller;
function* boot(router, instances, trasnform) {
    for (const instance of instances) {
        const meta = Reflect.get(instance, META);
        if (!meta) {
            continue;
        }
        const base = meta.$ctor || {};
        delete meta.$ctor;
        for (const key in meta) {
            const handler = Reflect.get(instance, key);
            if (typeof handler !== 'function') {
                continue;
            }
            const method = meta[key].method || base.method || 'get';
            const name = `/${base.name || '/'}/${meta[key].name || '/'}`;
            const middlewares = (base.middlewares || []).concat(meta[key].middlewares || []);
            const url = name.replace(/\/{2,}/g, '/').replace(/(.+)\/$/, '$1');
            const func = Reflect.get(router, method.toLowerCase());
            if (!func) {
                throw new Error(`method ${method} not found in router`);
            }
            const opts = { method, url, handler, middlewares };
            if (trasnform) {
                trasnform(opts);
            }
            Reflect.apply(func, router, [
                opts.url,
                ...opts.middlewares,
                opts.handler.bind(instance)
            ]);
            yield { method: opts.method, url: opts.url };
        }
        Reflect.deleteProperty(instance, META);
    }
}
exports.boot = boot;
function route(name, method, middlewares) {
    return function (target, prop) {
        let key;
        if (typeof target === 'function') {
            key = '$ctor';
            prop = target.name.replace(/(.+)controller$/i, '$1');
            Object.seal(target);
            Object.seal(target.prototype);
            target = target.prototype;
        }
        else {
            key = prop;
        }
        if (typeof prop === 'symbol') {
            return;
        }
        if (name == null) {
            name = prop;
        }
        else if (typeof name !== 'string') {
            middlewares = name;
            name = prop;
        }
        else if (typeof method !== 'string') {
            middlewares = method;
            method = undefined;
        }
        const value = { name, method, middlewares };
        if (!Reflect.has(target, META)) {
            Reflect.set(target, META, {});
        }
        const metadata = Reflect.get(target, META);
        Object.assign(metadata, { [key]: value });
    };
}
exports.route = route;
exports.default = Controller;
