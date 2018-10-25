/**
 * Model base class
 */
export abstract class Model<T extends Model<T> = any> {
    constructor(data?: Partial<T>) {
        if (data) {
            Object.assign(this, data)
        }
    }
}

export default Model
