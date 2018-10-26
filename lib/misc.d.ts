/// <reference types="node" />
import { Router } from 'express';
import { Conventions } from 'stringcase';
import { Config, Express, Logger, Server } from './types';
export declare function logHttp(app: Express, logger: Logger, style: string): void;
export declare function resolveHost(host: string, port: number): void;
export declare function prettifyTrace(stack: string, shorten?: boolean): string;
export declare function loadRoutes(dir: string, style?: Conventions): Router;
export declare function mountRoutes(dirname: string, app: Express, config: Config.App.Router): void;
export declare function setup(dirname: string, app: Express, config: Config): void;
export declare function start(app: Express, config: Config.Server): Server;
