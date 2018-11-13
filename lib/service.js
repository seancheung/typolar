"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const request_promise_1 = __importDefault(require("request-promise"));
const stringcase_1 = __importDefault(require("stringcase"));
const json_1 = require("./json");
const logger_1 = __importDefault(require("./logger"));
/**
 * Service base class
 */
class Service {
    constructor(options) {
        this._client = request_promise_1.default.defaults(Object.assign({
            json: true,
            resolveWithFullResponse: true
        }, options));
        this._logger = logger_1.default(stringcase_1.default.spinalcase(this.constructor.name));
    }
    /**
     * Create an instance of target type
     *
     * @param options Service options
     */
    static create(options) {
        if (!options) {
            const opts = require('./config').default;
            if (opts.app && opts.app.service) {
                const { transformer, baseUrl } = opts.app.service;
                options = Object.assign({ baseUrl }, transformer
                    ? {
                        jsonReplacer: json_1.replacer.bind(null, transformer.replacer),
                        jsonReviver: json_1.reviver.bind(null, transformer.reviver)
                    }
                    : {});
            }
        }
        return new this(options);
    }
    /**
     * Make request
     *
     * @param options Request options
     */
    async _request(options) {
        let { uri } = options;
        // tslint:disable-next-line:no-shadowed-variable
        const { method, replacer, reviver, baseUrl } = options;
        const { headers, query: qs, data: body } = await this._transformRequest(options);
        if (baseUrl === undefined && this._prefix) {
            uri = `/${this._prefix}/${uri}/`.replace(/\/{2,}/g, '/');
        }
        const opts = {
            uri,
            method,
            headers,
            qs,
            body
        };
        if (replacer !== undefined) {
            opts.jsonReplacer = replacer;
        }
        if (reviver !== undefined) {
            opts.jsonReviver = reviver;
        }
        if (baseUrl !== undefined) {
            opts.baseUrl = baseUrl;
        }
        const response = await this._send(opts);
        return this._transformResponse(response);
    }
    /**
     * Make a GET request
     *
     * @param uri Request uri
     * @param query Query string object
     */
    _get(uri, query) {
        return this._request({ uri, method: 'get', query });
    }
    /**
     * Make a POST request
     *
     * @param uri Request uri
     * @param data Request data
     */
    _post(uri, data) {
        return this._request({ uri, method: 'post', data });
    }
    /**
     * Hook to trasnform request query options
     *
     * @param options Query options
     * @returns Query options
     */
    _transformRequest(options) {
        return options;
    }
    /**
     * Hook to transform response data
     *
     * @param res Response
     * @returns Response data
     */
    _transformResponse(res) {
        return res.body;
    }
    /**
     * Transform value to target convention
     *
     * @param value Value to transform
     * @param style Convention
     */
    _transform(value, style) {
        return json_1.transform(style, value);
    }
    /**
     * Manually send a request(with pre-assigned options but not transform hooks)
     *
     * @param options Request options
     */
    async _send(options) {
        const response = await this._client(options);
        return response;
    }
    /**
     * Manually send a request(without pre-assigned options or transform hooks)
     *
     * @param options Request options
     */
    async _make(options) {
        const response = await request_promise_1.default(Object.assign({
            json: true,
            resolveWithFullResponse: true
        }, options));
        return response;
    }
}
exports.Service = Service;
exports.default = Service;
