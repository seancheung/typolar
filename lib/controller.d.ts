import { Handler, Middleware, Router } from './types';
declare type MixedDecorator = any;
interface Route {
    method: string;
    url: string;
    handler: Handler;
    middlewares: Middleware;
}
type Transform = (route: Route) => void;
export declare abstract class Controller {
}
export declare namespace Controller {
    function boot(router: Router, instances: Controller[], trasnform?: Transform): IterableIterator<{
        method: string;
        url: string;
    }>;
}
export declare function route(): MixedDecorator;
export declare function route(name: string): MixedDecorator;
export declare function route(middlewares: Middleware): MixedDecorator;
export declare function route(name: string, method: string): MixedDecorator;
export declare function route(name: string, middlewares: Middleware): MixedDecorator;
export declare function route(middlewares: Middleware, method: string): MixedDecorator;
export declare function route(name: string, method: string, middlewares: Middleware): MixedDecorator;
export {};
