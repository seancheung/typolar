// tslint:disable:naming-convention ban-types no-namespace
import { Request, RequestHandler } from 'express'
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
export interface Class<T = {}> {
    new (...args: any[]): T
}
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
export type Constructor = Function

import { Server } from 'http'
export { Server }
export type App = Express & {
    start(): Server
}

export interface Config {
    readonly app: Readonly<Config.App>
    readonly logger: Readonly<Config.Logger>
}

export declare namespace Config {
    interface Server {
        host: string
        port: number
    }
    interface App extends Server {
        tag: string
        router: Readonly<{
            style: Conventions
            baseUrl: string
            mock?: string
            path?: string
        }>
        service: Readonly<{
            baseUrl: string
            style?: Conventions
        }>
        view: Readonly<{
            engine: string
            path: string
        }>
    }
    interface Logger {
        http: {
            style: string
        }
        appenders: Readonly<{
            [x: string]: any
        }>
        categories: Readonly<{
            [x: string]: any
        }>
        stack: Readonly<{
            pretty?: boolean
        }>
    }
}
