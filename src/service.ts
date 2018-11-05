import request from 'request-promise'
import stringcase from 'stringcase'
import { replacer, reviver, transform } from './json'
import getLogger from './logger'
import { Awaitable, Class, Conventions, Logger, ServiceOptions } from './types'

export abstract class Service<TContract = any> {
    /**
     * Create an instance of target type
     *
     * @param options Service options
     */
    static create<T extends Service>(
        this: Class<T>,
        options?: ServiceOptions
    ): T {
        if (!options) {
            const opts = require('./config').default
            if (opts.app && opts.app.service) {
                const { transformer, baseUrl } = opts.app.service
                options = Object.assign(
                    { baseUrl },
                    transformer
                        ? {
                              jsonReplacer: replacer.bind(
                                  null,
                                  transformer.replacer
                              ),
                              jsonReviver: reviver.bind(
                                  null,
                                  transformer.reviver
                              )
                          }
                        : {}
                )
            }
        }
        return new this(options)
    }
    /**
     * Base uri
     */
    protected readonly _prefix?: string
    protected readonly _logger: Logger
    private readonly _client: typeof request

    constructor(options: ServiceOptions) {
        this._client = request.defaults(
            Object.assign(
                {
                    json: true,
                    resolveWithFullResponse: true
                },
                options
            )
        )
        this._logger = getLogger(stringcase.spinalcase(this.constructor.name))
    }

    /**
     * Make request
     *
     * @param options Request options
     */
    protected async _request<T = TContract>(options: Options): Promise<T> {
        let { uri } = options
        const { method } = options
        const { headers, query: qs, data: body } = await this._transformRequest(
            options as QueryOptions
        )
        if (this._prefix) {
            uri = `/${this._prefix}/${uri}/`.replace(/\/{2,}/g, '/')
        }
        const response = await this._send<T>({
            uri,
            method,
            headers,
            qs,
            body
        })
        return this._transformResponse(response)
    }

    /**
     * Make a GET request
     *
     * @param uri Request uri
     * @param query Query string object
     */
    protected _get<T = TContract>(uri: string, query?: Query): Promise<T> {
        return this._request<T>({ uri, method: 'get', query })
    }

    /**
     * Make a POST request
     *
     * @param uri Request uri
     * @param data Request data
     */
    protected _post<T = TContract>(uri: string, data?: any): Promise<T> {
        return this._request<T>({ uri, method: 'post', data })
    }

    /**
     * Trasnform request query options
     *
     * @param options Query options
     * @returns Query options
     */
    protected _transformRequest(
        options: Readonly<QueryOptions>
    ): Awaitable<QueryOptions> {
        return options
    }

    /**
     * Transform response data
     *
     * @param res Response
     * @returns Response data
     */
    protected _transformResponse<T = TContract>(
        res: Response<T>
    ): Awaitable<T> {
        return res.body
    }

    /**
     * Transform value to target convention
     *
     * @param value Value to transform
     * @param style Convention
     */
    protected _transform(value: any, style: Conventions): any {
        return transform(style, value)
    }

    private async _send<T = TContract>(options: any): Promise<Response<T>> {
        const response = await this._client(options)
        return response
    }
}

export type Query = Record<string, any>
export type Headers = Record<string, any>
export type Method = 'get' | 'post' | 'put' | 'delete' | 'patch'

export interface RequestOptions {
    uri: string
    method: Method
}

export interface QueryOptions {
    headers: Headers
    query: Query
    data: any
}

export interface Options
    extends Readonly<RequestOptions>,
        Partial<QueryOptions> {}

export interface Request {
    uri: URL
    method: string
    headers: Headers
}

export interface Response<T = any> {
    headers: Headers
    statusCode: number
    statusMessage: string
    body: T
    request: Request
}

export default Service
