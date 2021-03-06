import config from '../config'
import { CacheClient, Memcached, Memory } from './client'

let cache: CacheClient
switch (config.cache.driver) {
    case ':memory:':
        cache = new Memory()
        break
    case 'memcached':
        {
            // tslint:disable-next-line:no-var-requires
            const driver = require(require.resolve(config.cache.lib, {
                paths: [process.cwd()]
            })).createClient(config.cache.port, config.cache.host, config.cache)
            if (!driver.close) {
                driver.close = driver.end
            }
            cache = new Memcached(driver, config.cache.prefix)
        }
        break

    default:
        throw new Error('unknown driver type')
}

export { cache }
export default cache
