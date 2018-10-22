// tslint:disable:naming-convention ban-types no-namespace
import { Request, RequestHandler } from 'express'
import { Conventions } from 'stringcase'

export interface Request<T = any> extends Request {
    body: T
}

export type Handler = RequestHandler

export type Middleware = Handler[]

export type Conventions = Conventions

export { Response, Router, NextFunction as Next, Express as App } from 'express'
export { Logger } from 'log4js'

export type Awaitable<T> = T | Promise<T>
export type ListType<T> = T extends Array<infer P> ? P : never
export interface Class<T = {}> {
    new (...args: any[]): T
}
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
export type Constructor = Function

export interface Config {
    readonly app: Readonly<Config.App>
    readonly logger: Readonly<Config.Logger>
}

export declare namespace Config {
    interface App {
        tag: string
        host: string
        port: number
        view: {
            engine: string
        }
        router: Readonly<{
            style: Conventions
            baseUrl: string
            mockFile?: string
        }>
        service: Readonly<{
            baseUrl: string
        }>
        path: Readonly<{
            views: string
            routes: string
            models: string
            services: string
        }>
    }
    interface Logger {
        style: string
        appenders: {
            [x: string]: any
        }
        categories: Readonly<{
            [x: string]: any
        }>
        pretty: boolean
    }
}
