/// <reference types="node" />
declare type Fallback<T> = T | (() => T | Promise<T>);
export interface Driver {
    get(key: string, cb: (err?: Error, value?: string | Buffer, flags?: any) => void): void;
    set(key: string, value: string | Buffer, options: {
        expires?: number;
    }, cb: (err?: Error, success?: boolean) => void): void;
    add(key: string, value: string | Buffer, options: {
        expires?: number;
    }, cb: (err?: Error, success?: boolean) => void): void;
    delete(key: string, cb: (err?: Error, success?: boolean) => void): void;
    touch(key: string, ttl: number, cb: (err?: Error, success?: boolean) => void): void;
    close(): void;
}
export interface CacheClient {
    readonly prefix?: string;
    readonly serialize: (data: any) => string;
    readonly deserialize: (data: string) => any;
    add(key: string, value: any, ttl?: number): Promise<boolean>;
    get(key: string, fallback?: Fallback<any>, ttl?: number): Promise<any>;
    set(key: string, value: any, ttl?: number): Promise<boolean>;
    delete(key: string): Promise<boolean>;
    touch(key: string, ttl: number): Promise<boolean>;
    close(): void;
}
export declare class Memcached implements CacheClient {
    readonly prefix?: string;
    readonly serialize: {
        (value: any, replacer?: (key: string, value: any) => any, space?: string | number): string;
        (value: any, replacer?: (string | number)[], space?: string | number): string;
    };
    readonly deserialize: (text: string, reviver?: (key: any, value: any) => any) => any;
    private readonly _driver;
    constructor(driver: Driver, prefix?: string);
    close(): void;
    add(key: string, value: any, ttl?: number): Promise<boolean>;
    get(key: string, fallback?: Fallback<any>, ttl?: number): Promise<any>;
    set(key: string, value: any, ttl?: number): Promise<boolean>;
    delete(key: string): Promise<boolean>;
    touch(key: string, ttl: number): Promise<boolean>;
    private _wrap;
}
export declare class Memory implements CacheClient {
    readonly serialize: {
        (value: any, replacer?: (key: string, value: any) => any, space?: string | number): string;
        (value: any, replacer?: (string | number)[], space?: string | number): string;
    };
    readonly deserialize: (text: string, reviver?: (key: any, value: any) => any) => any;
    private readonly _store;
    private readonly _timers;
    constructor();
    close(): void;
    add(key: string, value: any, ttl?: number): Promise<boolean>;
    get(key: string, fallback?: Fallback<any>, ttl?: number): Promise<any>;
    set(key: string, value: any, ttl?: number): Promise<boolean>;
    delete(key: string): Promise<boolean>;
    touch(key: string, ttl: number): Promise<boolean>;
}
export {};
