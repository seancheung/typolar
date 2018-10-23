/// <reference types="express" />
import { Handler, Next, Request, Response } from './types';
export declare function fields(map: Record<string, string>): Handler;
export declare function params(map: Record<string, string>): Handler;
export declare function env(...envs: string[]): (req: Request<any>, res: Response, next: Next) => void;
