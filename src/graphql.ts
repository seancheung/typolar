import { Router } from 'express'
import graphql from 'express-graphql'
import { IResolvers, ITypedef, makeExecutableSchema } from 'graphql-tools'
import { Config } from 'kuconfig'
import path from 'path'
import { loadModules } from './misc'
import { Express } from './types'

export function mount(dirname: string, app: Express, config: Config.Graphql) {
    const router = Router({ mergeParams: true })
    const typeDefs: ITypedef[] = loadModules(
        path.resolve(dirname, config.types)
    )
    const resolvers: IResolvers[] = loadModules(
        path.resolve(dirname, config.resolvers)
    )
    router.use(
        graphql({
            schema: makeExecutableSchema({ typeDefs, resolvers }),
            graphiql: config.graphiql
        })
    )
    if (config.baseUrl) {
        app.use(config.baseUrl, router)
    } else {
        app.use(router)
    }
}

export default mount
