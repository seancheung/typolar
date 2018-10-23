import { Request, RequestHandler } from 'express';
import { Options as RequestOptions } from 'request-promise';
import { Conventions } from 'stringcase';
export interface Request<T = any> extends Request {
    body: T;
}
export declare type Handler = RequestHandler;
export declare type Middleware = Handler[];
export declare type Conventions = Conventions;
export declare type ServiceOptions = Partial<RequestOptions>;
export { Response, Router, NextFunction as Next, Express as App } from 'express';
export { Logger } from 'log4js';
export declare type Awaitable<T> = T | Promise<T>;
export declare type ListType<T> = T extends Array<infer P> ? P : never;
export interface Class<T = {}> {
    new (...args: any[]): T;
}
export declare type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export declare type Constructor = Function;
export interface Config {
    readonly app: Readonly<Config.App>;
    readonly logger: Readonly<Config.Logger>;
}
export declare namespace Config {
    interface App {
        tag: string;
        host: string;
        port: number;
        router: Readonly<{
            style: Conventions;
            baseUrl: string;
            mock?: string;
            path?: string;
        }>;
        service: Readonly<{
            baseUrl: string;
            style?: Conventions;
        }>;
        view: Readonly<{
            engine: string;
            path: string;
        }>;
    }
    interface Logger {
        http: {
            style: string;
        };
        appenders: Readonly<{
            [x: string]: any;
        }>;
        categories: Readonly<{
            [x: string]: any;
        }>;
        stack: Readonly<{
            pretty?: boolean;
        }>;
    }
}
