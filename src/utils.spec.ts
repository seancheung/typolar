import { expect } from 'chai'
import * as utils from './utils'

class ClassA {
    funcA() {
        //
    }
}

@utils.mixin(ClassA)
class ClassB {
    funcB() {
        //
    }
}

describe('utils test', function() {
    it('expect pick to work properly', function() {
        expect(utils.pick({ a: 1, b: 2, c: 3 }, 'a', 'c')).to.eql({
            a: 1,
            c: 3
        })
        expect(utils.pick({ a: 1, b: 2, c: 3 }, { a: '', c: '' })).to.eql({
            a: 1,
            c: 3
        })
    })

    it('expect strip to work properly', function() {
        expect(utils.strip({ a: 1, b: 2, c: 3 }, 'a', 'c')).to.eql({
            b: 2
        })
        expect(utils.strip({ a: 1, b: 2, c: 3 }, { a: '', c: '' })).to.eql({
            b: 2
        })
    })

    it('expect transformUrl to work properly', function() {
        expect(utils.transformUrl('/api/v1/get_user', 'pascalcase')).to.eq(
            '/Api/V1/GetUser'
        )
    })

    it('expect joinUrls to work properly', function() {
        expect(utils.joinUrls('api', 'v1', '/user/1')).to.eq('api/v1/user/1')
    })

    it('expect deepClone to work properly', function() {
        const src = { a: { b: 1 } }
        const tar = utils.deepClone(src)
        expect(src).to.eql(tar)
        expect(src).to.not.eq(tar)
        expect(src.a).to.not.eq(tar.a)
    })

    it('expect mixin to work properly', function() {
        const b = new ClassB()
        expect(b)
            .to.have.property('funcA')
            .which.is.a('function')
    })
})
