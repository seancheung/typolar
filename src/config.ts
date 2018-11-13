// tslint:disable:naming-convention
import config from 'kuconfig'
import { Conventions } from './types'
declare module 'kuconfig' {
    interface Config {
        readonly app: Readonly<Config.App>
        readonly logger: Readonly<Config.Logger>
        readonly graphql?: Readonly<Config.Graphql>
        readonly cache?: Readonly<Config.Cache>
    }
    namespace Config {
        interface Server {
            host: string
            port: number
        }
        interface App extends Server {
            tag: string
            router?: Readonly<App.Router>
            service?: Readonly<App.Service>
            view?: Readonly<App.View>
        }
        namespace App {
            interface Router {
                path: string
                style?: Conventions
                baseUrl?: string
                mock?: string
            }
            interface Service {
                baseUrl?: string
                transformer?: Service.Transformer
            }
            namespace Service {
                interface Transformer {
                    replacer?: Conventions
                    reviver?: Conventions
                }
            }
            interface View {
                engine: string
                path?: string
            }
        }
        interface Logger {
            http: {
                style: string
            }
            appenders: Readonly<{
                [x: string]: any
            }>
            categories: Readonly<{
                [x: string]: any
            }>
            stack: Readonly<{
                pretty?: boolean
            }>
        }
        interface Graphql {
            types: string
            resolvers: string
            baseUrl?: string
            graphiql?: boolean
        }
        type Cache = Cache.Memory | Cache.Memcached
        namespace Cache {
            interface Basic {
                session: Session
            }
            interface Memory extends Basic {
                driver: ':memory:'
            }
            interface Memcached extends Basic {
                driver: 'memcached'
                lib: string
                host: string
                port: number
                prefix?: string
                username?: string
                password?: string
            }
            interface Session {
                secret: string
                ttl: number
            }
        }
    }
}
export function desolve() {
    config.__.desolve()
    delete require.cache[__filename]
}
export { config }
export default config
