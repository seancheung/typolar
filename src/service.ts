import { Config } from 'kuconfig'
import request from 'request-promise'
import ioc from './ioc'
import { replacer, reviver, transform } from './json'
import { logger } from './logger'
import { Awaitable, Class, Conventions, Logger } from './types'

/**
 * Service base class
 */
export abstract class Service<TContract = any> {
    /**
     * Create an instance of target type
     *
     * @param options Service options
     */
    static create<T extends Service>(
        this: Class<T>,
        options?: Service.FullOptions
    ): T {
        if (!options) {
            const opts: Config = ioc(':config')
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
    @logger()
    protected readonly _logger: Logger
    /**
     * Base uri
     */
    protected readonly _prefix?: string
    private readonly _client: typeof request

    constructor(options: Service.FullOptions) {
        this._client = request.defaults(
            Object.assign(
                {
                    json: true,
                    resolveWithFullResponse: true
                },
                options
            )
        )
    }

    /**
     * Make request
     *
     * @param options Request options
     */
    protected async _request<T = TContract>(
        options: Service.Options
    ): Promise<T> {
        let { uri } = options
        // tslint:disable-next-line:no-shadowed-variable
        const { method, replacer, reviver, baseUrl } = options
        const { headers, query: qs, data: body } = await this._transformRequest(
            options as Service.QueryOptions
        )
        if (baseUrl === undefined && this._prefix) {
            uri = `/${this._prefix}/${uri}/`.replace(/\/{2,}/g, '/')
        }
        const opts: Service.FullOptions = {
            uri,
            method,
            headers,
            qs,
            body
        }
        if (replacer !== undefined) {
            opts.jsonReplacer = replacer
        }
        if (reviver !== undefined) {
            opts.jsonReviver = reviver
        }
        if (baseUrl !== undefined) {
            opts.baseUrl = baseUrl
        }
        const response = await this._send<T>(opts)
        return this._transformResponse(response)
    }

    /**
     * Make a GET request
     *
     * @param uri Request uri
     * @param query Query string object
     */
    protected _get<T = TContract>(
        uri: string,
        query?: Service.Query
    ): Promise<T> {
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
     * Hook to trasnform request query options
     *
     * @param options Query options
     * @returns Query options
     */
    protected _transformRequest(
        options: Service.QueryOptions
    ): Awaitable<Service.QueryOptions> {
        return options
    }

    /**
     * Hook to transform response data
     *
     * @param res Response
     * @returns Response data
     */
    protected _transformResponse<T = TContract>(
        res: Service.Response<T>
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

    /**
     * Manually send a request(with pre-assigned options but not transform hooks)
     *
     * @param options Request options
     */
    protected async _send<T = TContract>(
        options: Service.FullOptions
    ): Promise<Service.Response<T>> {
        const response = await this._client(options as any)
        return response
    }

    /**
     * Manually send a request(without pre-assigned options or transform hooks)
     *
     * @param options Request options
     */
    protected async _make<T = TContract>(
        options: Service.FullOptions
    ): Promise<Service.Response<T>> {
        const response = await request(
            Object.assign(
                {
                    json: true,
                    resolveWithFullResponse: true
                },
                options as any
            )
        )
        return response
    }
}

export declare namespace Service {
    // tslint:disable-next-line:no-shadowed-variable
    type FullOptions = Partial<request.Options>
    type Query = Record<string, any>
    type Headers = Record<string, any>
    type Method = 'get' | 'post' | 'put' | 'delete' | 'patch'

    interface RequestOptions {
        uri: string
        method: Method
    }

    interface QueryOptions {
        headers: Headers
        query: Query
        data: any
    }

    interface OverrideOptions {
        replacer: (key: string, value: any) => any
        reviver: (key: string, value: any) => any
        baseUrl: string
    }

    interface Options
        extends RequestOptions,
            Partial<QueryOptions>,
            Partial<OverrideOptions> {}

    interface Request {
        uri: URL
        method: string
        headers: Headers
    }

    interface Response<T = any> {
        headers: Headers
        statusCode: number
        statusMessage: string
        body: T
        request: Request
    }
}

export interface Contract<T = any> {
    success: boolean
    state: number
    msg?: string
    data?: T
}

export default Service
