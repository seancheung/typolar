"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const request_promise_1 = __importDefault(require("request-promise"));
const json_1 = require("./json");
class Service {
    constructor(options) {
        this._client = request_promise_1.default.defaults(Object.assign({
            json: true,
            resolveWithFullResponse: true
        }, options));
    }
    static create(options) {
        if (!options) {
            const config = require('kuconfig');
            options = {
                jsonReplacer: json_1.replacer.bind(null, config.app.service.style),
                jsonReviver: json_1.reviver.bind(null, config.app.service.style),
                baseUrl: config.app.service.baseUrl
            };
        }
        return new this(options);
    }
    async _request(options) {
        let { uri } = options;
        const { method } = options;
        const { headers, query: qs, data: body } = await this._transformRequest(options);
        if (this._prefix) {
            uri = `/${this._prefix}/${uri}/`.replace(/\/{2,}/g, '/');
        }
        const response = await this._send({
            uri,
            method,
            headers,
            qs,
            body
        });
        return this._transformResponse(response);
    }
    _get(uri, query) {
        return this._request({ uri, method: 'get', query });
    }
    _post(uri, data) {
        return this._request({ uri, method: 'post', data });
    }
    _transformRequest(options) {
        return options;
    }
    _transformResponse(res) {
        return res.body;
    }
    async _send(options) {
        const response = await this._client(options);
        return response;
    }
}
exports.Service = Service;
exports.default = Service;
