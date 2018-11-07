import config from 'kuconfig'
import { Config } from './types'
export function desolve() {
    config.__.desolve()
    delete require.cache[__filename]
}
export default (config as any) as Config
