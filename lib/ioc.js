"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const container = new Map();
function register(type, instance) {
    if (type !== undefined) {
        if (!container.has(type)) {
            if (instance === undefined) {
                instance = new type();
            }
            container.set(type, instance);
            return true;
        }
        return false;
    }
    return (ctor) => {
        if (!container.has(ctor)) {
            container.set(ctor, new ctor());
        }
    };
}
exports.register = register;
function fetch(type, register) {
    if (!container.has(type)) {
        if (register === true || register === undefined) {
            container.set(type, new type());
        }
    }
    if (container.has(type)) {
        return container.get(type);
    }
}
exports.fetch = fetch;
function flush(type) {
    if (type === undefined) {
        container.clear();
    }
    else {
        return container.delete(type);
    }
}
exports.flush = flush;
