// tslint:disable:no-unused-expression
import { expect } from 'chai'
import { Model } from './model'

class User extends Model<User> {
    id: number
    name: string

    constructor(data?: Partial<User>) {
        super()
        if (data) {
            this._copy(data, 'id', 'name')
        }
    }
}

describe('model test', function() {
    it('expect model props to be assigned properlly', function() {
        const user = new User({ id: 1, name: 'Adam', age: 23 } as any)
        expect(user.id).to.eq(1)
        expect(user.name).to.eq('Adam')
        expect((user as any).age).to.not.exist
    })

    it('expect model data to be copied properlly', function() {
        const user = new User()
        user.copy({ id: 1, name: 'Adam' })
        expect(user.id).to.not.exist
        expect(user.name).to.not.exist
        user.id = null
        user.name = null
        user.copy({ id: 1, name: 'Adam' })
        expect(user.id).to.eq(1)
        expect(user.name).to.eq('Adam')
    })
})
