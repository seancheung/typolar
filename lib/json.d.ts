import { Conventions } from './types';
/**
 * Transform an object's keys conventions recursively
 *
 * @param style Keys convention
 * @param value Object to transform
 */
export declare function transform(style: Conventions, value: any): any;
export declare function reviver(style: Conventions, key: string, value: any): any;
export declare function replacer(style: Conventions, key: string, value: any): any;
/**
 * Converts a JavaScript Object Notation (JSON) string into an object
 *
 * @param text A valid JSON string
 * @param style Keys convention
 */
export declare function parse(text: string, style: Conventions): any;
/**
 * Converts a JavaScript value to a JavaScript Object Notation (JSON) string
 *
 * @param value A JavaScript value, usually an object or array, to be converted
 * @param style Keys convention
 */
export declare function stringify(value: any, style: Conventions): string;
