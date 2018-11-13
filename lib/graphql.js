"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_graphql_1 = __importDefault(require("express-graphql"));
const graphql_tools_1 = require("graphql-tools");
const path_1 = __importDefault(require("path"));
const misc_1 = require("./misc");
function mount(dirname, app, config) {
    const router = express_1.Router({ mergeParams: true });
    const typeDefs = misc_1.loadModules(path_1.default.resolve(dirname, config.types));
    const resolvers = misc_1.loadModules(path_1.default.resolve(dirname, config.resolvers));
    router.use(express_graphql_1.default({
        schema: graphql_tools_1.makeExecutableSchema({ typeDefs, resolvers }),
        graphiql: config.graphiql
    }));
    if (config.baseUrl) {
        app.use(config.baseUrl, router);
    }
    else {
        app.use(router);
    }
}
exports.mount = mount;
exports.default = mount;
