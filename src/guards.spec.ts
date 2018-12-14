// tslint:disable:no-invalid-this
import bodyParser from 'body-parser'
import crypto from 'crypto'
import express from 'express'
import request from 'supertest'
import * as guards from './guards'
import * as jwt from './jwt'
import { handleError } from './misc'

describe('guards test', function() {
    before(function() {
        const app = express()
        app.use(bodyParser.json())
        app.post('/guards/body', guards.body(['name']), (req, res, next) => {
            res.end()
        })
        app.get(
            '/guards/query',
            guards.queries({
                color: {
                    message: 'Color must be specified'
                }
            }),
            (req, res, next) => {
                res.end()
            }
        )
        app.get(
            '/guards/headers',
            guards.headers({ version: 'Version' }),
            (req, res, next) => {
                res.end()
            }
        )
        app.get(
            '/guards/params/:id',
            guards.params({ id: /^\d+$/ }),
            (req, res, next) => {
                res.end()
            }
        )
        app.get(
            '/guards/env',
            guards.env('production', 'test_prod'),
            (req, res, next) => {
                res.end()
            }
        )
        app.get(
            '/guards/auth',
            guards.auth(async req => {
                let user
                try {
                    user = await jwt.verify(jwt.extract(req), '12345')
                } catch (error) {
                    //
                }
                return user
            }),
            (req, res, next) => {
                res.end()
            }
        )
        app.get(
            '/guards/options',
            guards.pagination(),
            guards.filter(),
            guards.sort(),
            guards.projection(),
            (req, res, next) => {
                res.json(req.$options)
            }
        )
        app.post(
            '/guards/access',
            guards.access({
                namespace: 'testapp',
                secret: '123456',
                key: 'abcxyz'
            }),
            (req, res, next) => {
                res.end()
            }
        )
        handleError(app)
        this.app = app
    })

    it('expect body guard to work properly', async function() {
        await request(this.app)
            .post('/guards/body')
            .type('json')
            .send({ age: 18 })
            .expect(400, {
                name: 'BadRequest',
                code: 400,
                message: 'name is required but missing in body'
            })
        await request(this.app)
            .post('/guards/body')
            .type('json')
            .send({ age: 18, name: 'Michael' })
            .expect(200)
    })

    it('expect query guard to work properly', async function() {
        await request(this.app)
            .get('/guards/query')
            .expect(400, {
                name: 'BadRequest',
                code: 400,
                message: 'Color must be specified'
            })
        await request(this.app)
            .get('/guards/query')
            .query({ color: 'blue' })
            .expect(200)
    })

    it('expect header guard to work properly', async function() {
        await request(this.app)
            .get('/guards/headers')
            .expect(400, {
                name: 'BadRequest',
                code: 400,
                message: 'Version is required but missing in headers'
            })
        await request(this.app)
            .get('/guards/headers')
            .set('version', '1.0.1')
            .expect(200)
    })

    it('expect params guard to work properly', async function() {
        await request(this.app)
            .get('/guards/params/abc')
            .expect(400, {
                name: 'BadRequest',
                code: 400,
                message: 'Invalid id in params'
            })
        await request(this.app)
            .get('/guards/params/123')
            .expect(200)
    })

    it('expect env guard to work properly', async function() {
        await request(this.app)
            .get('/guards/env')
            .expect(403)
        const env = process.env.NODE_ENV
        process.env.NODE_ENV = 'test_prod'
        await request(this.app)
            .get('/guards/env')
            .expect(200)
        process.env.NODE_ENV = env
    })

    it('expect auth guard to work properly', async function() {
        await request(this.app)
            .get('/guards/auth')
            .expect(401)
        const token = await jwt.sign({ id: 1 }, '12345', 30)
        await request(this.app)
            .get('/guards/auth')
            .auth(token, { type: 'bearer' })
            .expect(200)
    })

    it('expect options guard to work properly', async function() {
        await request(this.app)
            .get('/guards/options')
            .query({
                i: 3,
                s: 100,
                w: {
                    type: 'fruit'
                },
                o: JSON.stringify({
                    createdAt: -1
                }),
                p: ['id', 'name', 'createdAt']
            })
            .expect(200, {
                index: 3,
                limit: 100,
                offset: 300,
                order: {
                    createdAt: -1
                },
                select: ['id', 'name', 'createdAt'],
                where: {
                    type: 'fruit'
                }
            })
    })

    it('expect access guard to work properly', async function() {
        await request(this.app)
            .post('/guards/access')
            .send({ id: 1 })
            .expect(401)
        const md5 = crypto
            .createHash('md5')
            .update(JSON.stringify({ id: 1 }))
            .digest('hex')
        const sha1 = crypto
            .createHmac('sha1', '123456')
            .update('POST' + md5 + 'application/json' + '/guards/access')
            .digest('base64')
        const calc = 'testapp' + 'abcxyz' + ':' + sha1
        await request(this.app)
            .post('/guards/access')
            .set('authorization', calc)
            .send({ id: 1 })
            .expect(200)
    })
})
