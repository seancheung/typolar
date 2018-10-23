import { Awaitable, Class, ServiceOptions } from './types';
export declare abstract class Service<TContract = any> {
    static create<T extends Service>(this: Class<T>, options?: ServiceOptions): T;
    protected readonly _prefix?: string;
    private readonly _client;
    constructor(options: ServiceOptions);
    protected _request<T = TContract>(options: Service.Options): Promise<T>;
    protected _get<T = TContract>(uri: string, query?: Service.Query): Promise<T>;
    protected _post<T = TContract>(uri: string, data?: any): Promise<T>;
    protected _transformRequest(options: Readonly<Service.QueryOptions>): Awaitable<Service.QueryOptions>;
    protected _transformResponse<T = TContract>(res: Service.Response<T>): Awaitable<T>;
    private _send;
}
export declare namespace Service {
    type Query = Record<string, any>;
    type Headers = Record<string, any>;
    type Method = 'get' | 'post' | 'put' | 'delete' | 'patch';
    interface RequestOptions {
        uri: string;
        method: Method;
    }
    interface QueryOptions {
        headers: Headers;
        query: Query;
        data: any;
    }
    interface Options extends Readonly<RequestOptions>, Partial<QueryOptions> {
    }
    interface Contract<T = any> {
        success: boolean;
        state: number;
        msg?: string;
        data?: T;
    }
    interface Request {
        uri: URL;
        method: string;
        headers: Headers;
    }
    interface Response<T = any> {
        headers: Headers;
        statusCode: number;
        statusMessage: string;
        body: T;
        request: Request;
    }
}
