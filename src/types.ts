// tslint:disable:naming-convention ban-types no-namespace
import { Request, RequestHandler } from 'express'
import { Config } from 'kuconfig'
import { Options as RequestOptions } from 'request-promise'
import { Conventions } from 'stringcase'

export interface Request<T = any> extends Request {
    body: T
}

export type Handler = RequestHandler

export type Middleware = Handler[]

export type Conventions = Conventions

export type ServiceOptions = Partial<RequestOptions>

import { Express, Router as ExpressRouter } from 'express'
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

export type Validator =
    | Validator.Types
    | Validator.ArrayTypes
    | Validator.ObjectTypes
export declare namespace Validator {
    type Check = (value: any) => boolean
    type Types =
        | typeof String
        | typeof Number
        | typeof Boolean
        | typeof Object
        | typeof Array
        | RegExp
        | Check
    interface ArrayTypes {
        [index: number]: Types | ArrayTypes
    }
    interface ObjectTypes {
        [key: string]: Types | ArrayTypes | ObjectTypes
    }
}

export type Hooks = Partial<{
    beforeLoad: () => Config
    beforeSetup: (app: Express) => void
    beforeMount: (app: Express) => void
    afterMount: (app: Express) => void
    afterSetup: (app: Express) => void
}>

export interface Contract<T = any> {
    success: boolean
    state: number
    msg?: string
    data?: T
}

export declare namespace Service {
    type Query = Record<string, any>
    type Headers = Record<string, any>
    type Method = 'get' | 'post' | 'put' | 'delete' | 'patch'

    interface RequestOptions {
        uri: string
        method: Method
    }

    interface QueryOptions {
        headers: Headers
        query: Query
        data: any
    }

    interface Options extends Readonly<RequestOptions>, Partial<QueryOptions> {}

    interface Request {
        uri: URL
        method: string
        headers: Headers
    }

    interface Response<T = any> {
        headers: Headers
        statusCode: number
        statusMessage: string
        body: T
        request: Request
    }
}

export declare namespace guards {
    interface FiledOptions {
        /**
         * Custom validator
         */
        validator?: Validator
        /**
         * Custom error message
         */
        message?: string
        /**
         * Field can be omitted
         */
        optional?: boolean
    }
    type Field =
        | string
        | Exclude<Validator, Validator.ObjectTypes>
        | FiledOptions
    type Fields = Record<string, Field>
    interface Pagination {
        /**
         * Page index query string name
         * @default 'i'
         */
        indexName?: string
        /**
         * Page size query string name
         * @default 's'
         */
        sizeName?: string
        /**
         * Page max size
         * @default 200
         */
        maxSize?: number
        /**
         * Page min size
         * @default 5
         */
        minSize?: number
        /**
         * Page default size
         * @default 20
         */
        defaultSize?: number
    }
    interface Filter {
        /**
         * Filter query string name
         * @default 'w'
         */
        filterName?: string
    }
    interface Sort {
        /**
         * Sort query string name
         * @default 'o'
         */
        sortName?: string
    }
    interface Projection {
        /**
         * Projection query string name
         * @default 'p'
         */
        projectionName?: string
    }
    interface Access {
        /**
         * Signing namespace
         */
        namespace: string
        /**
         * Signing key
         */
        key: string
        /**
         * Signing secret
         */
        secret: string
    }
}

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
