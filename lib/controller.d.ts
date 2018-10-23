/// <reference types="express" />
import { Handler, Middleware, Router } from './types';
declare type MixedDecorator = any;
interface Route {
    method: string;
    url: string;
    handler: Handler;
    middlewares: Middleware;
}
declare type Transform = (route: Route) => void;
export declare abstract class Controller {
}
export declare function route(): MixedDecorator;
export declare function route(name: string): MixedDecorator;
export declare function route(middlewares: Middleware): MixedDecorator;
export declare function route(name: string, method: string): MixedDecorator;
export declare function route(name: string, middlewares: Middleware): MixedDecorator;
export declare function route(middlewares: Middleware, method: string): MixedDecorator;
export declare function route(name: string, method: string, middlewares: Middleware): MixedDecorator;
export { Response, NextFunction as Next } from 'express';
export declare function boot(router: Router, instances: Controller[], trasnform?: Transform): IterableIterator<{
    method: string;
    url: string;
}>;
