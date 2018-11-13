/// <reference types="express" />
/// <reference types="node" />
import { Server } from 'http';
import { Config } from 'kuconfig';
import { Express, Hooks, Logger } from './types';
export declare class Application {
    private _app;
    private _options;
    private _logger;
    private _server;
    /**
     * Internal express instance
     */
    readonly express: Express;
    /**
     * Options
     */
    readonly options: Readonly<Config>;
    /**
     * Logger
     */
    readonly logger: Logger;
    /**
     * Create a new instance of Application
     *
     * @param dirname Application entrypoint directory
     */
    constructor(dirname: string);
    /**
     * Create a new instance of Application
     *
     * @param dirname Application entrypoint directory
     * @param hooks Application hooks
     */
    constructor(dirname: string, hooks: Hooks);
    /**
     * Start listening
     */
    start(): Server;
}
export default Application;
