import { expect } from 'chai'
import { Model } from './model'

class User extends Model {
    id: number
    name: string
}

describe('model test', function() {
    it('expect model props to be assigned properlly', function() {
        const user = new User({ id: 1, name: 'Adam', age: 23 })
        expect(user.id).to.eq(1)
        expect(user.name).to.eq('Adam')
    })
})
