import log4js from 'log4js';
import { Config } from './types';
export declare function initialize(config: Config.Logger): void;
declare const _default: (category?: string) => log4js.Logger;
export default _default;
