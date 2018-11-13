import { Store } from 'express-session';
import { CacheClient } from './client';
interface StoreOptions {
    ttl?: number;
    prefix?: string;
}
export declare class CacheStore extends Store {
    private _client;
    private readonly _ttl?;
    private readonly _prefix?;
    constructor(_client: CacheClient, options: StoreOptions);
    get: (sid: string, cb: (err: Error, session?: Express.SessionData) => void) => void;
    set: (sid: string, session: Express.SessionData, cb: (err: Error) => void) => void;
    destroy: (sid: string, cb: (err: Error) => void) => void;
    touch: (sid: string, session: Express.SessionData, cb: (err: Error) => void) => void;
}
export default CacheStore;
