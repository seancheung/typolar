"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_session_1 = require("express-session");
class CacheStore extends express_session_1.Store {
    constructor(_client, options) {
        super(options);
        this._client = _client;
        this.get = (sid, cb) => {
            this._client
                .get(`${this._prefix}${sid}`)
                .then(s => cb(null, s))
                .catch(err => cb(err));
        };
        this.set = (sid, session, cb) => {
            this._client
                .set(`${this._prefix}${sid}`, session, this._ttl)
                .then(() => cb(null))
                .catch(err => cb(err));
        };
        this.destroy = (sid, cb) => {
            this._client
                .delete(`${this._prefix}${sid}`)
                .then(() => cb(null))
                .catch(err => cb(err));
        };
        this.touch = (sid, session, cb) => {
            this._client
                .touch(`${this._prefix}${sid}`, this._ttl)
                .then(() => cb(null))
                .catch(err => cb(err));
        };
        this._ttl = options.ttl;
        this._prefix = options.prefix || 'SESSION:';
    }
}
exports.CacheStore = CacheStore;
exports.default = CacheStore;
