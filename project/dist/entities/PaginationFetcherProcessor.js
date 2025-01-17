"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GRAPHQL_STATE_BEFORE = exports.GRAPHQL_STATE_LAST = exports.GRAPHQL_STATE_AFTER = exports.GRAPHQL_STATE_FIRST = exports.GRAPHQL_STATE_PAGINATION_INFO = exports.PaginationFetcherProcessor = void 0;
const graphql_ts_client_api_1 = require("graphql-ts-client-api");
class PaginationFetcherProcessor {
    constructor(schema) {
        this.schema = schema;
    }
    process(fetcher) {
        var _a;
        const [connName, connField] = this.findConnectionField(fetcher);
        return [connName, (_a = connField.fieldOptionsValue) === null || _a === void 0 ? void 0 : _a.alias, this.adjustConnection(fetcher, connName, connField)];
    }
    findConnectionField(fetcher) {
        var _a;
        const fetchableFieldMap = fetcher.fetchableType.fields;
        let connName = undefined;
        let connField = undefined;
        for (const [name, field] of fetcher.fieldMap) {
            const fetchableField = fetchableFieldMap.get(name);
            if ((fetchableField === null || fetchableField === void 0 ? void 0 : fetchableField.category) === "CONNECTION") {
                if (connName !== undefined) {
                    throw new Error(`Cannot parse pagiation query because there are two root connection fields of the fetcher: ` +
                        `"${connName}" and "${name}"`);
                }
                connName = name;
                connField = field;
            }
        }
        if (connName === undefined || connField === undefined) {
            throw new Error(`Cannot parse pagiation query because there are no connection root fields of the fetcher`);
        }
        for (const argName of CONN_ARG_NAMES) {
            if (((_a = connField.argGraphQLTypes) === null || _a === void 0 ? void 0 : _a.has(argName)) !== true) {
                throw new Error(`Cannot parse pagiation query because there is not argument "${argName}" of connection field "${connName}"`);
            }
            if (isArgumentSpecified(connField.args, argName)) {
                throw new Error(`Cannot parse pagiation query, the argument "${argName}" of connection field "${connName}" cannot be specified`);
            }
        }
        return [connName, connField];
    }
    adjustConnection(fetcher, connName, connField) {
        if (connField.childFetchers === undefined) {
            throw new Error(`No child fetcher for connection`);
        }
        return fetcher["addField"](connName, Object.assign(Object.assign({}, connField.args), { first: graphql_ts_client_api_1.ParameterRef.of(exports.GRAPHQL_STATE_FIRST), after: graphql_ts_client_api_1.ParameterRef.of(exports.GRAPHQL_STATE_AFTER), last: graphql_ts_client_api_1.ParameterRef.of(exports.GRAPHQL_STATE_LAST), before: graphql_ts_client_api_1.ParameterRef.of(exports.GRAPHQL_STATE_BEFORE) }), this.adjustPageInfo(connField.childFetchers[0]), connField.fieldOptionsValue);
    }
    adjustPageInfo(connFetcher) {
        var _a;
        const pageInfoFetchableField = connFetcher.fetchableType.fields.get("pageInfo");
        if (pageInfoFetchableField === undefined) {
            throw new Error(`No field "pageInfo" declared in "${connFetcher.fetchableType.name}"`);
        }
        if (pageInfoFetchableField.targetTypeName === undefined) {
            throw new Error(`The field "pageInfo" of "${connFetcher.fetchableType.name}" cannot be simple scalar type`);
        }
        const pageInfoFetcher = this.schema.fetcher(pageInfoFetchableField.targetTypeName);
        if (pageInfoFetcher === undefined) {
            throw new Error(`No fetcher for "${pageInfoFetchableField.targetTypeName}" is added into schema`);
        }
        for (const argName of PAGE_ARG_NAMES) {
            if (!pageInfoFetcher.fetchableType.fields.has(argName)) {
                throw new Error(`There is no field "${argName}" declared in "${pageInfoFetchableField.targetTypeName}"`);
            }
            if (pageInfoFetcher.fetchableType.fields.get(argName).isFunction) {
                throw new Error(`The field "${argName}" declared in "${pageInfoFetchableField.targetTypeName}" must be simple field`);
            }
        }
        const pageInfoField = connFetcher.findField("pageInfo");
        if (pageInfoField === undefined) {
            return connFetcher["pageInfo"](pageInfoFetcher["hasNextPage"]["hasPreviousPage"]["startCursor"]["endCursor"]);
        }
        let existingPageInfoFetcher = pageInfoField.childFetchers[0];
        for (const argName of PAGE_ARG_NAMES) {
            if (!existingPageInfoFetcher.findField("argName") === undefined) {
                existingPageInfoFetcher = existingPageInfoFetcher[argName];
            }
        }
        return connFetcher["addField"]("pageInfo", undefined, existingPageInfoFetcher, (_a = connFetcher.fieldMap.get("pageInfo")) === null || _a === void 0 ? void 0 : _a.fieldOptionsValue);
    }
}
exports.PaginationFetcherProcessor = PaginationFetcherProcessor;
function graphqlStateVariableName(name) {
    return `graphql_state_${name}__`;
}
exports.GRAPHQL_STATE_PAGINATION_INFO = graphqlStateVariableName("pagination_info");
exports.GRAPHQL_STATE_FIRST = graphqlStateVariableName("first");
exports.GRAPHQL_STATE_AFTER = graphqlStateVariableName("after");
exports.GRAPHQL_STATE_LAST = graphqlStateVariableName("last");
exports.GRAPHQL_STATE_BEFORE = graphqlStateVariableName("before");
function isArgumentSpecified(args, name) {
    if (args !== undefined) {
        const value = args[name];
        if (value !== undefined) {
            if (value[" $__instanceOfParameterRef"]) {
                const refName = value.name;
                if (refName === name || refName === graphqlStateVariableName(name)) {
                    return false;
                }
            }
            return true;
        }
    }
    return false;
}
const CONN_ARG_NAMES = ["first", "after", "last", "before"];
const PAGE_ARG_NAMES = ["hasNextPage", "hasPreviousPage", "startCursor", "endCursor"];
