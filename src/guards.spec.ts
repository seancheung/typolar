// tslint:disable:no-invalid-this
import bodyParser from 'body-parser'
import express from 'express'
import request from 'supertest'
import * as guards from './guards'
import { handleError } from './misc'

describe('guards test', function() {
    before(function() {
        const app = express()
        app.use(bodyParser.json())
        app.post(
            '/guards/body',
            guards.body({ name: 'Username' }),
            (req, res, next) => {
                res.end()
            }
        )
        app.get(
            '/guards/query',
            guards.queries({ color: 'Color' }),
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
                message: 'Username missing in body'
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
                message: 'Color missing in query'
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
                message: 'Version missing in headers'
            })
        await request(this.app)
            .get('/guards/headers')
            .set('version', '1.0.1')
            .expect(200)
    })
})
