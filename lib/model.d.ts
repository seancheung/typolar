import { Class } from './types';
export declare abstract class Model {
    constructor(data?: any);
}
export declare function injectable<T extends Class>(ctor: T): {
    new (...args: any[]): {};
} & T;
export declare function inject<T extends Class<Model>>(type: T): PropertyDecorator;
export declare function injectArray<T extends Class<Model>>(type: T): PropertyDecorator;
