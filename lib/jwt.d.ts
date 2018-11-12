import { Request } from './types';
/**
 * Sign a payload
 *
 * @param payload Payload to sign
 * @param secret Secret
 * @param ttl Expiration in seconds
 */
export declare function sign(payload: any, secret: string, ttl: number): Promise<string>;
/**
 * Extract token from request cookies or headers
 *
 * @param req Request
 */
export declare function extract(req: Request): string;
/**
 * Verify token
 *
 * @param token Token
 * @param secret Secret
 */
export declare function verify(token: string, secret: string): Promise<any>;
