// tslint:disable:no-invalid-this no-unused-expression
import { expect } from 'chai'
import { inject, ioc } from './ioc'

describe('ioc test', function() {
    class MyClass {
        name = 'myClass'

        @inject('counter', {
            writable: true,
            enumerable: true
        })
        count: number
    }

    it('expect ioc to work properly', function() {
        ioc('key', '12345')
        expect(ioc('key')).to.eq('12345')
        ioc('key', 'abcd')
        expect(ioc('key')).to.eq('12345')
        ioc.flush('key')
        expect(ioc('key')).to.be.undefined
        ioc.flush()
    })

    it('expect ioc mode to work properly', function() {
        ioc.mode = ioc.Mode.Overwrite
        ioc('key', '123')
        expect(ioc('key')).to.eq('123')
        ioc('key', '456')
        expect(ioc('key')).to.eq('456')
        ioc.mode = ioc.Mode.Reject
        expect(() => ioc('key', 'xyz')).to.throw(ioc.DuplicateRegistrationError)
        ioc.flush()
        ioc.mode = ioc.Mode.Ignore
    })

    it('expect inject decorator to work properly', function() {
        ioc('counter', 100)
        const target = new MyClass()
        expect(JSON.stringify(target)).to.eq('{"name":"myClass"}')
        expect(target.count).to.eq(100)
        expect(JSON.stringify(target)).to.eq('{"name":"myClass","count":100}')
        ioc.flush()
    })

    it('expect inject decorator overwrite mode to work properly', function() {
        ioc.mode = ioc.Mode.Overwrite
        ioc('counter', 100)
        const target = new MyClass()
        expect(target.count).to.eq(100)
        ioc('counter', 200)
        expect(target.count).to.eq(100)
        target.count = 300
        expect(target.count).to.eq(300)
        ioc.flush()
        ioc.mode = ioc.Mode.Ignore
    })
})
