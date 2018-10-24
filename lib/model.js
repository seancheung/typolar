"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Model {
    constructor(data) {
    }
}
exports.Model = Model;
function injectable(ctor) {
    return class extends ctor {
        constructor(...args) {
            super(...args);
            const data = args[0];
            if (data) {
                if (data) {
                    Object.entries(data)
                        .filter(([k, v]) => Reflect.has(this, k))
                        .forEach(([k, v]) => Reflect.set(this, k, v));
                }
            }
        }
    };
}
exports.injectable = injectable;
function inject(type) {
    return function func(target, key) {
        let value = Reflect.get(target, key);
        Reflect.deleteProperty(target, key);
        Reflect.defineProperty(target, key, {
            enumerable: true,
            configurable: true,
            get() {
                return value;
            },
            set(v) {
                if (v == null) {
                    value = v;
                }
                else {
                    value = new type(v);
                }
            }
        });
    };
}
exports.inject = inject;
function injectArray(type) {
    return function func(target, key) {
        let value = Reflect.get(target, key);
        Reflect.deleteProperty(target, key);
        Reflect.defineProperty(target, key, {
            enumerable: true,
            configurable: true,
            get() {
                return value;
            },
            set(v) {
                if (v == null) {
                    value = v;
                }
                else if (!Array.isArray(v)) {
                    throw new Error('array expected');
                }
                else {
                    value = v.map((i) => (i == null ? i : new type(i)));
                }
            }
        });
    };
}
exports.injectArray = injectArray;
exports.default = Model;
