import { Class, Conventions } from './types';
/**
 * Check if running in dev mode
 */
export declare function isDevMode(): boolean;
/**
 * Apply a trait/mixin to a class
 *
 * @param trait Mixin trait to apply with
 */
export declare function mixin(trait: Class): (ctor: Class<any>) => void;
/**
 * Make a deep cloned copy of target object
 *
 * @param obj Object to clone
 */
export declare function deepClone<T>(obj: T): T;
/**
 * Join urls
 *
 * @param urls urls
 */
export declare function joinUrls(...urls: string[]): string;
/**
 * Transform url string by the given styles
 *
 * @param url Original url string
 * @param styles stringcase transform style
 */
export declare function transformUrl(url: string, style: Conventions): string;
/**
 * Pick selected keys from source object into a new object
 *
 * @param obj Object to pick from
 * @param keys Properties to pick
 */
export declare function pick<T, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K>;
/**
 * Pick selected keys from source object into a new object
 *
 * @param obj Object to pick from
 * @param keys Object to pick with keys of
 */
export declare function pick<T, K extends keyof T>(obj: T, keys: Record<K, any>): Pick<T, K>;
/**
 * Pick keys not selected from source object into a new object
 *
 * @param obj Object to pick from
 * @param keys Properties to exclude
 */
export declare function strip<T, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, Exclude<keyof T, K>>;
/**
 * Pick keys not selected from source object into a new object
 *
 * @param obj Object to pick from
 * @param keys Object to exclude keys of
 */
export declare function strip<T, K extends keyof T>(obj: T, keys: Record<K, any>): Pick<T, Exclude<keyof T, K>>;
