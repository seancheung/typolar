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
export declare function mixin<T extends Class>(trait: T): (ctor: T) => void;
/**
 * Make a deep cloned copy of target object
 *
 * @param obj Object to clone
 */
export declare function deepClone(obj: any): any;
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
