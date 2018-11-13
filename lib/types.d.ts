import { Request, RequestHandler } from 'express';
import { Config } from 'kuconfig';
import { Options as RequestOptions } from 'request-promise';
import { Conventions } from 'stringcase';
export interface Request<T = any> extends Request {
    body: T;
}
export declare type Handler = RequestHandler;
export declare type Middleware = Handler[];
export declare type Conventions = Conventions;
export declare type ServiceOptions = Partial<RequestOptions>;
import { Express, Router as ExpressRouter } from 'express';
declare type Router = ExpressRouter;
export { Router };
export { Response, NextFunction as Next, Express } from 'express';
import { Logger as Log4js } from 'log4js';
declare type Logger = Log4js;
export { Logger };
export declare type Awaitable<T> = T | Promise<T>;
export declare type ListType<T> = T extends Array<infer P> ? P : never;
export interface Class<T = any> {
    new (...args: any[]): T;
}
export declare type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export declare type Constructor = Function;
export declare type Hooks = Partial<{
    beforeLoad: () => Config;
    beforeSetup: (app: Express) => void;
    beforeMount: (app: Express) => void;
    afterMount: (app: Express) => void;
    afterSetup: (app: Express) => void;
}>;
export interface Contract<T = any> {
    success: boolean;
    state: number;
    msg?: string;
    data?: T;
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
