import { Class, Conventions } from './types';
export declare function isDevMode(): boolean;
export declare function mixin<T extends Class>(trait: T): (ctor: T) => void;
export declare function deepClone(obj: any): any;
export declare function joinUrls(...urls: string[]): string;
export declare function transformUrl(url: string, style: Conventions): string;
