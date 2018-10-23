import { Awaitable, Class, ServiceOptions } from './types';
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
export interface Options extends Readonly<RequestOptions>, Partial<QueryOptions> {
}
export interface Contract<T = any> {
    success: boolean;
    state: number;
    msg?: string;
    data?: T;
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
export declare abstract class Service<TContract = any> {
    static create<T extends Service>(this: Class<T>, options?: ServiceOptions): T;
    protected readonly _prefix?: string;
    private readonly _client;
    constructor(options: ServiceOptions);
    protected _request<T = TContract>(options: Options): Promise<T>;
    protected _get<T = TContract>(uri: string, query?: Query): Promise<T>;
    protected _post<T = TContract>(uri: string, data?: any): Promise<T>;
    protected _transformRequest(options: Readonly<QueryOptions>): Awaitable<QueryOptions>;
    protected _transformResponse<T = TContract>(res: Response<T>): Awaitable<T>;
    private _send;
}
