// tslint:disable:no-unused-expression
import { expect } from 'chai'
import * as utils from './utils'

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
        const b = new ClassB()
        expect(b)
            .to.have.property('funcA')
            .which.is.a('function')
    })

    it('expect validate to work properly', function() {
        expect(utils.validate(String, '1')).to.be.true
        expect(utils.validate(String, 1)).to.be.false
        expect(utils.validate(Number, 1)).to.be.true
        expect(utils.validate(Number, '1')).to.be.false
        expect(utils.validate(Boolean, false)).to.be.true
        expect(utils.validate(Boolean, true)).to.be.true
        expect(utils.validate(Array, [])).to.be.true
        expect(utils.validate(Array, {})).to.be.false
        expect(utils.validate(Object, [])).to.be.true
        expect(utils.validate(Object, {})).to.be.true
        expect(utils.validate(Object, null)).to.be.false
        expect(utils.validate(null, null)).to.be.true
        expect(utils.validate(undefined, undefined)).to.be.true
        expect(utils.validate(/^abc.+/, '123abc')).to.be.false
        expect(utils.validate(/^abc.+/, 'abc123')).to.be.true
        expect(utils.validate([String], ['a', 'b'])).to.be.true
        expect(utils.validate([String], ['a', 'b', 1])).to.be.false
        expect(utils.validate([String, Number], ['a', 1])).to.be.true
        expect(utils.validate([[String]], [['a']])).to.be.true
        expect(utils.validate({ name: String }, { name: null })).to.be.false
        expect(utils.validate({ name: String }, { name: 'haha' })).to.be.true
        expect(
            utils.validate(
                { child: { name: String } },
                { child: { name: 'haha' } }
            )
        ).to.be.true
    })
})
