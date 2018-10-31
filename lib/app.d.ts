/// <reference types="express" />
/// <reference types="node" />
import { Config, Express, Hooks, Logger, Server } from './types';
declare class Application {
    private _app;
    private _options;
    private _logger;
    private _server;
    readonly express: Express;
    readonly options: Readonly<Config>;
    readonly logger: Logger;
    constructor(dirname: string);
    constructor(dirname: string, hooks: Hooks);
    start(): Server;
}
export default Application;
