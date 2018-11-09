import { Class } from './types';
/**
 * Register a class
 *
 * @param type Class type
 */
export declare function register<T extends Class>(type: T): boolean;
/**
 * Register a class instance
 *
 * @param type Class type
 */
export declare function register<T extends Class>(type: T, instance: InstanceType<T>): boolean;
/**
 * Register a class
 */
export declare function register<T extends Class>(): ClassDecorator;
/**
 * Fetch a class instance
 *
 * @param type Class type
 * @param register Auto register if not found
 */
export declare function fetch<T extends Class>(type: T, register: false): InstanceType<T> | void;
/**
 * Fetch a class instance
 *
 * @param type Class type
 * @param register Auto register if not found
 */
export declare function fetch<T extends Class>(type: T, register?: true): InstanceType<T>;
/**
 * Flush all registered instances
 */
export declare function flush<T extends Class>(): void;
/**
 * Flush  registered instance of the given type
 */
export declare function flush<T extends Class>(type: T): boolean;
