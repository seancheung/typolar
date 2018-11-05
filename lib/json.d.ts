import { Conventions } from './types';
export declare function transform(style: Conventions, value: any): any;
export declare function reviver(style: Conventions, key: string, value: any): any;
export declare function replacer(style: Conventions, key: string, value: any): any;
export declare function parse(text: string, style: Conventions): any;
export declare function stringify(value: any, style: Conventions): string;
