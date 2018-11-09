/**
 * Model base class
 */
export declare abstract class Model<T extends Model<T> = any> {
    constructor(data?: Partial<T>);
    /**
     * Copy only exising keys into this model
     *
     * @param data Data to copy
     */
    copy(data: Partial<T>): void;
    /**
     * Copy selected keys from source object to this model
     *
     * @param src Source to copy from
     * @param keys Keys to copy
     */
    protected _copy<K extends keyof T>(src: Partial<T>, ...keys: K[]): void;
    /**
     * Copy selected keys from source object to this model
     *
     * @param src Source to copy from
     * @param keys Object to copy keys of
     */
    protected _copy<K extends keyof T>(src: Partial<T>, keys: Record<K, any>): void;
}
export default Model;
