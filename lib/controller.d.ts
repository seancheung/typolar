import { Handler, Logger, Middleware, Router } from './types';
declare type MixedDecorator = any;
interface Route {
    method: string;
    url: string;
    handler: Handler;
    middlewares: Middleware;
}
declare type Transform = (route: Route) => void;
/**
 * Controller base class
 */
export declare abstract class Controller {
    protected readonly _logger: Logger;
    constructor();
}
export declare function boot(router: Router, instances: Controller[], trasnform?: Transform): IterableIterator<{
    method: string;
    url: string;
}>;
/**
 * Mark a controller or its member as a route
 */
export declare function route(): MixedDecorator;
/**
 * Mark a controller or its member as a route
 *
 * @param name Route name
 * @description When used on a Controller, it's like baseUrl
 */
export declare function route(name: string): MixedDecorator;
/**
 * Mark a controller or one of its member as a route
 *
 * @param middlewares Middlewares
 * @description When used on a Controller, they'll be inserted to each member
 */
export declare function route(middlewares: Middleware): MixedDecorator;
/**
 * Mark a controller or one of its member as a route
 *
 * @param name Route name
 * @param method Route method
 * @description When used on a Controller, name works like baseUrl and method becomes the default method for each member
 */
export declare function route(name: string, method: string): MixedDecorator;
/**
 * Mark a controller or one of its member as a route
 *
 * @param name Route name
 * @param middlewares Middlewares
 * @description When used on a Controller, name works like baseUrl and middlewares will be inserted to each member
 */
export declare function route(name: string, middlewares: Middleware): MixedDecorator;
/**
 * Mark a controller or one of its member as a route
 *
 * @param middlewares Middlewares
 * @param method Route method
 * @description When used on a Controller, middlewares will be inserted to each member and method becomes the default method for each member
 */
export declare function route(middlewares: Middleware, method: string): MixedDecorator;
/**
 * Mark a controller or one of its member as a route
 *
 * @param name Route name
 * @param method Route method
 * @param middlewares Middlewares
 * @description When used on a Controller, name works like baseUrl, method becomes the default method for each member and middlewares will be inserted to each member
 */
export declare function route(name: string, method: string, middlewares: Middleware): MixedDecorator;
export default Controller;
