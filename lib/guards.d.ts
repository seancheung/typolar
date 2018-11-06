/// <reference types="express" />
import { Handler, Next, Request, Response } from './types';
/**
 * Check required field exists in request body
 *
 * @param map Required fields map with key being the field key and value being the hint value
 */
export declare function fields(map: Record<string, string>): Handler;
/**
 * Check required field exists in request params
 *
 * @param map Required fields map with key being the field key and value being the hint value
 */
export declare function params(map: Record<string, string>): Handler;
/**
 * Success if current running NODE_ENV maches any
 *
 * @param envs Possible envs
 */
export declare function env(...envs: string[]): (req: Request<any>, res: Response, next: Next) => void;
