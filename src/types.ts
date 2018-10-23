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
