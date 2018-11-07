// tslint:disable:no-invalid-this
import { expect } from 'chai'
import express from 'express'
import request from 'supertest'
import * as errors from './errors'
import { handleError } from './misc'

describe('errors test', function() {
    before(function() {
        const app = express()
        app.get('/context', (req, res, next) => {
            next(
                new errors.ContextError(
                    { state: 10001, errmsg: 'fatal' },
                    'bad things'
                )
            )
        })
        handleError(app)
        this.app = app
    })

    it('expect 404 error', function() {
        return request(this.app)
            .get('/oops')
            .expect(404)
            .expect('content-type', /json/)
            .expect(res => {
                expect(res.body).to.eql({
                    name: 'NotFound',
                    code: 404,
                    message: 'Not Found'
                })
            })
    })

    it('expect errors to be serialized properly', function() {
        return request(this.app)
            .get('/context')
            .expect(500)
            .expect('content-type', /json/)
            .expect(res => {
                expect(res.body).to.eql({
                    name: 'ContextError',
                    code: 500,
                    message: 'bad things',
                    state: 10001,
                    errmsg: 'fatal'
                })
            })
    })
})
