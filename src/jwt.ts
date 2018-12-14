import jwt from 'jsonwebtoken'
import { Request } from './types'

/**
 * Sign a payload
 *
 * @param payload Payload to sign
 * @param secret Secret
 * @param ttl Expiration expressed in seconds or a string describing a time span zeit/ms. Eg: 60, "2 days", "10h", "7d"
 */
export function sign(
    payload: any,
    secret: string,
    ttl: number | string
): Promise<string> {
    return new Promise((resolve, reject) => {
        jwt.sign(
            payload,
            secret,
            { expiresIn: ttl },
            (err?: Error, encoded?: string) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(encoded)
                }
            }
        )
    })
}

/**
 * Extract token from request cookies or headers
 *
 * @param req Request
 */
export function extract(req: Request): string {
    let token = (req.cookies && req.cookies.jwt) || req.headers.authorization
    if (token) {
        const matches = token.match(/(\S+)\s+(\S+)/)
        if (matches && (matches[1] === 'JWT' || matches[1] === 'Bearer')) {
            token = matches[2]
        }
    }

    return token
}

/**
 * Verify token
 *
 * @param token Token
 * @param secret Secret
 * @throws {jwt.VerifyErrors}
 */
export function verify(token: string, secret: string): Promise<any> {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secret, (err?: jwt.VerifyErrors, decoded?: any) => {
            if (err) {
                reject(err)
            } else {
                resolve(decoded)
            }
        })
    })
}
