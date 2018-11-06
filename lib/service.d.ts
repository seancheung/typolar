import { Awaitable, Class, Conventions, Logger, ServiceOptions } from './types';
/**
 * Service base class
 */
export declare abstract class Service<TContract = any> {
    /**
     * Create an instance of target type
     *
     * @param options Service options
     */
    static create<T extends Service>(this: Class<T>, options?: ServiceOptions): T;
    /**
     * Base uri
     */
    protected readonly _prefix?: string;
    protected readonly _logger: Logger;
    private readonly _client;
    constructor(options: ServiceOptions);
    /**
     * Make request
     *
     * @param options Request options
     */
    protected _request<T = TContract>(options: Options): Promise<T>;
    /**
     * Make a GET request
     *
     * @param uri Request uri
     * @param query Query string object
     */
    protected _get<T = TContract>(uri: string, query?: Query): Promise<T>;
    /**
     * Make a POST request
     *
     * @param uri Request uri
     * @param data Request data
     */
    protected _post<T = TContract>(uri: string, data?: any): Promise<T>;
    /**
     * Hook to trasnform request query options
     *
     * @param options Query options
     * @returns Query options
     */
    protected _transformRequest(options: QueryOptions): Awaitable<QueryOptions>;
    /**
     * Hook to transform response data
     *
     * @param res Response
     * @returns Response data
     */
    protected _transformResponse<T = TContract>(res: Response<T>): Awaitable<T>;
    /**
     * Transform value to target convention
     *
     * @param value Value to transform
     * @param style Convention
     */
    protected _transform(value: any, style: Conventions): any;
    /**
     * Manually send a request(with pre-assigned options but not transform hooks)
     *
     * @param options Request options
     */
    protected _send<T = TContract>(options: ServiceOptions): Promise<Response<T>>;
    /**
     * Manually send a request(without pre-assigned options or transform hooks)
     *
     * @param options Request options
     */
    protected _make<T = TContract>(options: ServiceOptions): Promise<Response<T>>;
}
export declare type Query = Record<string, any>;
export declare type Headers = Record<string, any>;
export declare type Method = 'get' | 'post' | 'put' | 'delete' | 'patch';
export interface RequestOptions {
    uri: string;
    method: Method;
}
export interface QueryOptions {
    headers: Headers;
    query: Query;
    data: any;
}
export interface OverrideOptions {
    replacer: (key: string, value: any) => any;
    reviver: (key: string, value: any) => any;
    baseUrl: string;
}
export interface Options extends RequestOptions, Partial<QueryOptions>, Partial<OverrideOptions> {
}
export interface Request {
    uri: URL;
    method: string;
    headers: Headers;
}
export interface Response<T = any> {
    headers: Headers;
    statusCode: number;
    statusMessage: string;
    body: T;
    request: Request;
}
export default Service;
