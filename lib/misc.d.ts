/// <reference types="node" />
import { Router } from 'express';
import { Server } from 'http';
import { Config } from 'kuconfig';
import { Conventions } from 'stringcase';
import { Express, Hooks, Logger } from './types';
/**
 * Mount http logging
 *
 * @param app App instance
 * @param morgan Morgan instance
 * @param logger Logger instance
 * @param style log style
 */
export declare function logHttp(app: Express, logger: Logger, style: string): void;
/**
 * Resolve IP address
 *
 * @param config
 */
export declare function resolveHost(host: string, port: number): void;
/**
 * Prettify stack trace
 *
 * @param stack Stack trace
 * @param shorten Cut file path to relative
 */
export declare function prettifyTrace(stack: string, shorten?: boolean): string;
declare type Filter = (filename: string) => boolean;
/**
 * Load all modules in a directory
 *
 * @param dir Modules directory
 * @param filter Filter
 */
export declare function loadModules(dir: string, filter?: RegExp | Filter): any[];
/**
 * Boot all routes in target directory
 *
 * @param dir Routes directory
 * @param style Url transform style
 */
export declare function loadRoutes(dir: string, style?: Conventions): Router;
/**
 * Mount router
 *
 * @param dirname Application entrypoint directory
 * @param app Express application instance
 * @param config Router config
 */
export declare function mountRoutes(dirname: string, app: Express, config: Config.App.Router): Router;
/**
 * Setup application
 *
 * @param dirname Application entrypoint directory
 * @param app Express application instance
 * @param config Config
 * @param hooks Hooks
 */
export declare function setup(dirname: string, app: Express, config: Config, hooks?: Hooks): void;
/**
 * Mount error handler
 *
 * @param app Express instance
 */
export declare function handleError(app: Express, logger?: Logger): void;
export declare function start(app: Express, config: Config.Server): Server;
export {};
