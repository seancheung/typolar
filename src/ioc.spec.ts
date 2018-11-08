// tslint:disable:no-invalid-this no-unused-expression
import { expect } from 'chai'
import { fetch, flush, register } from './ioc'

@register()
class MyClass {
    name = 'myClass'
}

class MySecond {
    name = 'mySecond'
}

describe('ioc test', function() {
    it('expect register decorator to work properly', function() {
        expect(fetch(MyClass, false))
            .to.be.instanceof(MyClass)
            .with.property('name', 'myClass')
    })

    it('expect inline register to work properly', function() {
        expect(fetch(MySecond, false)).to.be.undefined
        register(MySecond)
        expect(fetch(MySecond, false))
            .to.be.instanceof(MySecond)
            .with.property('name', 'mySecond')
    })

    it('expect flush to work properly', function() {
        register(MySecond)
        flush(MySecond)
        expect(fetch(MySecond, false)).to.be.undefined
        expect(fetch(MyClass, false)).to.be.instanceof(MyClass)
        flush()
        expect(fetch(MyClass, false)).to.be.undefined
    })

    it('expect auto register to work properly', function() {
        flush()
        expect(fetch(MyClass, false)).to.be.undefined
        expect(fetch(MySecond, false)).to.be.undefined
        expect(fetch(MyClass)).to.be.instanceof(MyClass)
        expect(fetch(MySecond)).to.be.instanceof(MySecond)
    })

    it('expect instance register to work properly', function() {
        flush()
        const instance = new MySecond()
        register(MySecond, instance)
        expect(fetch(MySecond, false)).to.eq(instance)
    })
})
