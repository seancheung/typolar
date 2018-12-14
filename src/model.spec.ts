// tslint:disable:no-unused-expression
import { expect } from 'chai'
import { Model, prop } from './model'

describe('model test', function() {
    class User extends Model {
        @prop(Number)
        id: number

        @prop(/^.{3,}$/)
        name: string

        @prop()
        phone: string

        @prop([String])
        tags: string[]

        member?: boolean

        @prop({ key: String })
        data: any
    }

    class ExtendedUser extends User {
        key: string

        @prop()
        age: number
    }

    it('expect model props to be initialized properlly', function() {
        const user = new User({
            id: 1,
            name: 'Adam',
            age: 23,
            phone: '12345',
            member: true
        } as any)
        expect(user.id).to.eq(1)
        expect(user.name).to.eq('Adam')
        expect(user.phone).to.eq('12345')
        expect(user.member).to.not.exist
        expect((user as any).age).to.not.exist
        expect(JSON.stringify(user)).to.eq(
            '{"id":1,"name":"Adam","phone":"12345"}'
        )
    })

    it('expect model props to be assigned properlly', function() {
        const user = new User()
        expect(() => user.assign({ tags: 'abc' })).to.throw(
            prop.ValidationError
        )
        expect(() => user.assign({ tags: ['abc'] })).to.not.throw(
            prop.ValidationError
        )
        expect(() => user.assign({ data: {} })).to.throw(prop.ValidationError)
        expect(() => user.assign({ data: { key: 'abc' } })).to.not.throw(
            prop.ValidationError
        )
    })

    it('expect model props to be inherited properlly', function() {
        const user = new ExtendedUser({
            id: 1,
            name: 'Bob',
            member: false,
            count: 100,
            age: 20,
            key: 'abc',
            data: { key: 'abc' }
        })
        expect(user.id).to.eq(1)
        expect(user.name).to.eq('Bob')
        expect(user.member).to.not.exist
        expect((user as any).count).to.not.exist
        expect(user.key).to.not.exist
        expect(user.age).to.eq(20)
    })
})
