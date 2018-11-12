// tslint:disable:no-unused-expression no-invalid-this
import { expect } from 'chai'
import { Memory } from './cache/client'

describe('cache test', function() {
    before(function() {
        this.cache = new Memory()
    })

    it('expect cache.get to work properly', async function() {
        const value1 = await this.cache.get('key1')
        expect(value1).to.not.exist
        const value2 = await this.cache.get('key2', 'value2', 1)
        expect(value2).to.eq('value2')
        const value3 = await this.cache.get('key3', () => 'value3', 1)
        expect(value3).to.eq('value3')
    })

    it('expect cache ttl to work properly', async function() {
        const success = await this.cache.set('key4', 1, 0.1)
        expect(success).to.be.true
        const value4 = await this.cache.get('key4')
        expect(value4).to.exist
        await new Promise(r => setTimeout(r, 100))
        const value5 = await this.cache.get('key4')
        expect(value5).to.not.exist
    })
})
