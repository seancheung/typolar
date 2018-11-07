// tslint:disable:no-invalid-this
import { expect } from 'chai'

describe('config test', function() {
    before(function() {
        process.env.CONFIG_FILE = 'src/config.spec.json'
    })

    it('expect config to be loaded properlly', function() {
        const config = require('./config').default
        expect(config)
            .to.have.property('app')
            .which.is.an('object')
            .with.property('port')
            .which.eqls(8000)
    })

    it('expect config to be desolved properlly', function() {
        require('./config').desolve()
        process.env.APP_PORT = '8080'
        const config = require('./config').default
        expect(config)
            .to.have.property('app')
            .which.is.an('object')
            .with.property('port')
            .which.eqls(8080)
        delete process.env.APP_PORT
    })

    after(function() {
        delete process.env.CONFIG_FILE
        require('./config').desolve()
    })
})
