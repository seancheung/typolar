import { Store } from 'express-session'
import { CacheClient } from './client'

interface StoreOptions {
    ttl?: number
    prefix?: string
}

export default class CacheStore extends Store {
    private readonly _ttl?: number
    private readonly _prefix?: string
    constructor(private _client: CacheClient, options: StoreOptions) {
        super(options)
        this._ttl = options.ttl
        this._prefix = options.prefix || 'SESSION:'
    }

    get = (
        sid: string,
        cb: (err: Error, session?: Express.SessionData) => void
    ) => {
        this._client
            .get(`${this._prefix}${sid}`)
            .then(s => cb(null, s))
            .catch(err => cb(err))
    }

    set = (
        sid: string,
        session: Express.SessionData,
        cb: (err: Error) => void
    ) => {
        this._client
            .set(`${this._prefix}${sid}`, session, this._ttl)
            .then(() => cb(null))
            .catch(err => cb(err))
    }

    destroy = (sid: string, cb: (err: Error) => void) => {
        this._client
            .delete(`${this._prefix}${sid}`)
            .then(() => cb(null))
            .catch(err => cb(err))
    }

    touch = (
        sid: string,
        session: Express.SessionData,
        cb: (err: Error) => void
    ) => {
        this._client
            .touch(`${this._prefix}${sid}`, this._ttl)
            .then(() => cb(null))
            .catch(err => cb(err))
    }
}
