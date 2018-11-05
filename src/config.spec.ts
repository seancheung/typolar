// tslint:disable:no-invalid-this
import { expect } from 'chai'

describe('model test', function() {
    before(function() {
        process.env.CONFIG_FILE = 'src/config.spec.json'
        this.config = require('./config').default
    })
    it('expect config to be loaded properlly', function() {
        expect(this.config)
            .to.have.property('app')
            .which.is.an('object')
            .with.property('port')
    })
})
