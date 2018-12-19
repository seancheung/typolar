// tslint:disable:naming-convention ban-types no-namespace
import { Request, RequestHandler } from 'express'
import { Conventions } from 'stringcase'

export interface Request<T = any> extends Request {
    body: T
}

export type Handler = RequestHandler

export type Middleware = Handler[]

export type Conventions = Conventions

import { Router as ExpressRouter } from 'express'
type Router = ExpressRouter
export { Router }
export { Response, NextFunction as Next, Express } from 'express'
import { Logger as Log4js } from 'log4js'
type Logger = Log4js
export { Logger }

export type Awaitable<T> = T | Promise<T>
export type ListType<T> = T extends Array<infer P> ? P : never
export interface Class<T = any> {
    new (...args: any[]): T
}
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
export type Constructor = Function

declare global {
    namespace Express {
        interface Request {
            /**
             * Parsed query options
             */
            $options?: QueryOptions
            /**
             * Auth user
             */
            $user?: any
        }
        interface QueryOptions {
            /**
             * Parsed pagination skipped count
             */
            offset?: number
            /**
             * Parsed pagination page size
             */
            limit?: number
            /**
             * Current pagination index
             */
            index?: number
            /**
             * Parsed where query
             */
            where?: any
            /**
             * Parsed order query
             */
            order?: any
            /**
             * Parsed projection query
             */
            select?: any
        }
    }
}
