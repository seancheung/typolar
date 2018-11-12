type Fallback<T> = T | (() => T | Promise<T>)

export interface Driver {
    get(
        key: string,
        cb: (err?: Error, value?: string | Buffer, flags?: any) => void
    ): void
    set(
        key: string,
        value: string | Buffer,
        options: { expires?: number },
        cb: (err?: Error, success?: boolean) => void
    ): void
    add(
        key: string,
        value: string | Buffer,
        options: { expires?: number },
        cb: (err?: Error, success?: boolean) => void
    ): void
    delete(key: string, cb: (err?: Error, success?: boolean) => void): void
    touch(
        key: string,
        ttl: number,
        cb: (err?: Error, success?: boolean) => void
    ): void
    close(): void
}

export interface CacheClient {
    readonly prefix?: string
    readonly serialize: (data: any) => string
    readonly deserialize: (data: string) => any
    add(key: string, value: any, ttl?: number): Promise<boolean>
    get(key: string, fallback?: Fallback<any>, ttl?: number): Promise<any>
    set(key: string, value: any, ttl?: number): Promise<boolean>
    delete(key: string): Promise<boolean>
    touch(key: string, ttl: number): Promise<boolean>
    close(): void
}

export class Memcached implements CacheClient {
    readonly prefix?: string
    readonly serialize = JSON.stringify
    readonly deserialize = JSON.parse
    private readonly _driver: Driver

    constructor(driver: Driver, prefix?: string) {
        this.prefix = prefix
        this._driver = driver
    }
    close(): void {
        this._driver.close()
    }

    add(key: string, value: any, ttl?: number): Promise<boolean> {
        key = this._wrap(key)
        value = this.serialize(value)
        return new Promise((resolve, reject) => {
            this._driver.add(key, value, { expires: ttl }, (err, success) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(success)
                }
            })
        })
    }

    get(key: string, fallback?: Fallback<any>, ttl?: number): Promise<any> {
        key = this._wrap(key)
        return new Promise((resolve, reject) => {
            this._driver.get(key, async (err, value, flags) => {
                if (err) {
                    reject(err)
                } else {
                    let data = this.deserialize(value as any)
                    if (data == null && fallback) {
                        if (typeof fallback === 'function') {
                            data = await (fallback as any)()
                        } else {
                            data = fallback
                        }
                        if (data != null) {
                            await this.set(key, data, ttl)
                        }
                    }
                    resolve(data)
                }
            })
        })
    }

    set(key: string, value: any, ttl?: number): Promise<boolean> {
        key = this._wrap(key)
        value = this.serialize(value)
        return new Promise((resolve, reject) => {
            this._driver.set(key, value, { expires: ttl }, (err, success) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(success)
                }
            })
        })
    }

    delete(key: string): Promise<boolean> {
        key = this._wrap(key)
        return new Promise((resolve, reject) => {
            this._driver.delete(key, (err, success) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(success)
                }
            })
        })
    }

    touch(key: string, ttl: number): Promise<boolean> {
        key = this._wrap(key)
        return new Promise((resolve, reject) => {
            this._driver.touch(key, ttl, (err, success) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(success)
                }
            })
        })
    }

    private _wrap(key: string): string {
        if (this.prefix) {
            return `${this.prefix}-${key}`
        }
        return key
    }
}

export class Memory implements CacheClient {
    readonly serialize = JSON.stringify
    readonly deserialize = JSON.parse
    private readonly _store: Map<string, any>
    private readonly _timers: Map<string, NodeJS.Timer>

    constructor() {
        this._store = new Map()
        this._timers = new Map()
    }

    close(): void {
        this._store.clear()
        this._timers.forEach(t => clearTimeout(t))
        this._timers.clear()
    }

    async add(key: string, value: any, ttl?: number): Promise<boolean> {
        if (this._store.has(key)) {
            return false
        }
        value = this.serialize(value)
        this._store.set(key, value)
        if (ttl) {
            this._timers.set(
                key,
                setTimeout(() => {
                    this._store.delete(key)
                    this._timers.delete(key)
                }, ttl)
            )
        }
        return true
    }

    async get(
        key: string,
        fallback?: Fallback<any>,
        ttl?: number
    ): Promise<any> {
        if (!this._store.has(key)) {
            let data
            if (fallback) {
                if (typeof fallback === 'function') {
                    data = await (fallback as any)()
                } else {
                    data = fallback
                }
            }
            if (data != null) {
                await this.set(key, data, ttl)
            }
            return data
        }
        const value = this._store.get(key)
        return this.deserialize(value)
    }

    async set(key: string, value: any, ttl?: number): Promise<boolean> {
        value = this.serialize(value)
        this._store.set(key, value)
        if (ttl) {
            this._timers.set(
                key,
                setTimeout(() => {
                    this._store.delete(key)
                    this._timers.delete(key)
                }, ttl)
            )
        }
        return true
    }

    async delete(key: string): Promise<boolean> {
        const success = this._store.delete(key)
        if (success) {
            const timer = this._timers.get(key)
            if (timer) {
                clearTimeout(timer)
                this._timers.delete(key)
            }
        }
        return success
    }

    async touch(key: string, ttl: number): Promise<boolean> {
        const success = this._store.has(key)
        if (success) {
            const timer = this._timers.get(key)
            if (timer) {
                clearTimeout(timer)
                this._timers.delete(key)
            }
            this._timers.set(
                key,
                setTimeout(() => {
                    this._store.delete(key)
                    this._timers.delete(key)
                }, ttl)
            )
        }
        return success
    }
}
