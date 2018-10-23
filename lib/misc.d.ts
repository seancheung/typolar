/// <reference types="express" />
import { Conventions } from 'stringcase';
import { App, Config, Logger, Router } from './types';
export declare function logHttp(app: App, logger: Logger, style: string): void;
export declare function resolveHost(host: string, port: number): void;
export declare function prettifyTrace(stack: string, shorten?: boolean): string;
export declare function loadRoutes(dir: string, style?: Conventions): Router;
export declare function mountRoutes(app: App, config: Config.App): void;
