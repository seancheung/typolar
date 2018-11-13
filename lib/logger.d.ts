import { Config } from 'kuconfig';
import log4js from 'log4js';
export declare function initialize(config: Config.Logger): void;
declare const _default: (category?: string) => log4js.Logger;
export default _default;
