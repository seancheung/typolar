"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/**
 * Sign a payload
 *
 * @param payload Payload to sign
 * @param secret Secret
 * @param ttl Expiration in seconds
 */
function sign(payload, secret, ttl) {
    return new Promise((resolve, reject) => {
        jsonwebtoken_1.default.sign(payload, secret, { expiresIn: ttl }, (err, encoded) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(encoded);
            }
        });
    });
}
exports.sign = sign;
/**
 * Extract token from request cookies or headers
 *
 * @param req Request
 */
function extract(req) {
    let token = req.cookies.jwt || req.headers.authorization;
    if (token) {
        const matches = token.match(/(\S+)\s+(\S+)/);
        if (matches && matches[1] === 'JWT') {
            token = matches[2];
        }
    }
    return token;
}
exports.extract = extract;
/**
 * Verify token
 *
 * @param token Token
 * @param secret Secret
 */
function verify(token, secret) {
    return new Promise((resolve, reject) => {
        jsonwebtoken_1.default.verify(token, secret, (err, decoded) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(decoded);
            }
        });
    });
}
exports.verify = verify;
