"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Memcached {
    constructor(driver, prefix) {
        this.serialize = JSON.stringify;
        this.deserialize = JSON.parse;
        this.prefix = prefix;
        this._driver = driver;
    }
    close() {
        this._driver.close();
    }
    add(key, value, ttl) {
        key = this._wrap(key);
        value = this.serialize(value);
        return new Promise((resolve, reject) => {
            this._driver.add(key, value, { expires: ttl }, (err, success) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(success);
                }
            });
        });
    }
    get(key, fallback, ttl) {
        key = this._wrap(key);
        return new Promise((resolve, reject) => {
            this._driver.get(key, async (err, value, flags) => {
                if (err) {
                    reject(err);
                }
                else {
                    let data = this.deserialize(value);
                    if (data == null && fallback) {
                        if (typeof fallback === 'function') {
                            data = await fallback();
                        }
                        else {
                            data = fallback;
                        }
                        if (data != null) {
                            await this.set(key, data, ttl);
                        }
                    }
                    resolve(data);
                }
            });
        });
    }
    set(key, value, ttl) {
        key = this._wrap(key);
        value = this.serialize(value);
        return new Promise((resolve, reject) => {
            this._driver.set(key, value, { expires: ttl }, (err, success) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(success);
                }
            });
        });
    }
    delete(key) {
        key = this._wrap(key);
        return new Promise((resolve, reject) => {
            this._driver.delete(key, (err, success) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(success);
                }
            });
        });
    }
    touch(key, ttl) {
        key = this._wrap(key);
        return new Promise((resolve, reject) => {
            this._driver.touch(key, ttl, (err, success) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(success);
                }
            });
        });
    }
    _wrap(key) {
        if (this.prefix) {
            return `${this.prefix}-${key}`;
        }
        return key;
    }
}
exports.Memcached = Memcached;
class Memory {
    constructor() {
        this.serialize = JSON.stringify;
        this.deserialize = JSON.parse;
        this._store = new Map();
        this._timers = new Map();
    }
    close() {
        this._store.clear();
        this._timers.forEach(t => clearTimeout(t));
        this._timers.clear();
    }
    async add(key, value, ttl) {
        if (this._store.has(key)) {
            return false;
        }
        value = this.serialize(value);
        this._store.set(key, value);
        if (ttl) {
            this._timers.set(key, setTimeout(() => {
                this._store.delete(key);
                this._timers.delete(key);
            }, ttl));
        }
        return true;
    }
    async get(key, fallback, ttl) {
        if (!this._store.has(key)) {
            let data;
            if (fallback) {
                if (typeof fallback === 'function') {
                    data = await fallback();
                }
                else {
                    data = fallback;
                }
            }
            if (data != null) {
                await this.set(key, data, ttl);
            }
            return data;
        }
        const value = this._store.get(key);
        return this.deserialize(value);
    }
    async set(key, value, ttl) {
        value = this.serialize(value);
        this._store.set(key, value);
        if (ttl) {
            this._timers.set(key, setTimeout(() => {
                this._store.delete(key);
                this._timers.delete(key);
            }, ttl));
        }
        return true;
    }
    async delete(key) {
        const success = this._store.delete(key);
        if (success) {
            const timer = this._timers.get(key);
            if (timer) {
                clearTimeout(timer);
                this._timers.delete(key);
            }
        }
        return success;
    }
    async touch(key, ttl) {
        const success = this._store.has(key);
        if (success) {
            const timer = this._timers.get(key);
            if (timer) {
                clearTimeout(timer);
                this._timers.delete(key);
            }
            this._timers.set(key, setTimeout(() => {
                this._store.delete(key);
                this._timers.delete(key);
            }, ttl));
        }
        return success;
    }
}
exports.Memory = Memory;
