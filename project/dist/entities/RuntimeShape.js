"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toRuntimeShape0 = exports.toRuntimeShape = void 0;
const graphql_ts_client_api_1 = require("graphql-ts-client-api");
const Variables_1 = require("../state/impl/Variables");
function toRuntimeShape(fetcher, variables) {
    return toRuntimeShape0("", fetcher, variables);
}
exports.toRuntimeShape = toRuntimeShape;
function toRuntimeShape0(parentPath, fetcher, variables) {
    const runtimeShapeFieldMap = new Map();
    for (const [fieldName, field] of fetcher.fieldMap) {
        addField(parentPath, fieldName, field, runtimeShapeFieldMap, variables);
    }
    const fields = [];
    for (const [, field] of runtimeShapeFieldMap) {
        fields.push(field);
    }
    fields.sort((a, b) => {
        if (a.name < b.name) {
            return -1;
        }
        if (a.name > b.name) {
            return +1;
        }
        return 0;
    });
    return new RuntimeShapeImpl(fetcher.fetchableType.name, fields);
}
exports.toRuntimeShape0 = toRuntimeShape0;
function addField(parentPath, fieldName, field, runtimeShapeFieldMap, fetcherVaribles) {
    var _a;
    if (fieldName.startsWith("...")) {
        if (field.childFetchers !== undefined) {
            for (const childFetcher of field.childFetchers) {
                for (const [subFieldName, subField] of childFetcher.fieldMap) {
                    addField(parentPath, subFieldName, subField, runtimeShapeFieldMap, fetcherVaribles);
                }
            }
        }
        return;
    }
    const variables = Variables_1.standardizedVariables(resolveParameterRefs(field.args, fetcherVaribles));
    if (field.argGraphQLTypes !== undefined) {
        for (const [name, type] of field.argGraphQLTypes) {
            if (type.endsWith("!") && (variables === undefined || variables[name] === undefined)) {
                throw new Error(`Illegal fetch path ${parentPath}${fieldName}, its required arguments ${name} is not specified`);
            }
        }
    }
    const alias = (_a = field.fieldOptionsValue) === null || _a === void 0 ? void 0 : _a.alias;
    const directives = standardizedDirectives(field, fetcherVaribles);
    const childShape = field.childFetchers !== undefined ?
        toRuntimeShape0(`${parentPath}${fieldName}/`, field.childFetchers[0], fetcherVaribles) :
        undefined;
    runtimeShapeFieldMap.set(fieldName, {
        name: fieldName,
        variables,
        alias,
        directives,
        childShape
    });
}
function standardizedDirectives(field, fetcherVaribles) {
    const map = {};
    const names = [];
    if (field.fieldOptionsValue !== undefined) {
        for (const [name, variables] of field.fieldOptionsValue.directives) {
            names.push(name);
            map[name] = resolveParameterRefs(variables, fetcherVaribles);
        }
    }
    if (names.length === 0) {
        return undefined;
    }
    if (names.length === 1) {
        return map;
    }
    names.sort();
    const result = {};
    for (const name of names) {
        result[name] = map[name];
    }
    return result;
}
function resolveParameterRefs(variables, fetcherVariables) {
    if (variables === undefined || variables === null) {
        return undefined;
    }
    const names = [];
    const resolved = {};
    if (variables !== undefined && variables !== null) {
        for (const name in variables) {
            let value = variables[name];
            if (value instanceof graphql_ts_client_api_1.ParameterRef) {
                value = fetcherVariables !== undefined ? fetcherVariables[value.name] : undefined;
            }
            if (value !== undefined && value !== null) {
                names.push(name);
                resolved[name] = value;
            }
        }
    }
    if (names.length === 0) {
        return undefined;
    }
    if (names.length === 1) {
        return resolved;
    }
    names.sort();
    const result = {};
    for (const name of names) {
        result[name] = resolved[name];
    }
    return result;
}
class RuntimeShapeImpl {
    constructor(typeName, fields) {
        this.typeName = typeName;
        this.fields = fields;
    }
    toString() {
        let value = this._toString;
        if (value === undefined) {
            this._toString = value = `(${this.typeName},[${this.fields.map(fieldString)}])`;
        }
        return value;
    }
}
function fieldString(field) {
    return `(${field.name},${field.variables !== undefined ?
        JSON.stringify(field.variables) :
        ""},${field.alias !== undefined ?
        field.alias :
        ""},${field.directives !== undefined ?
        JSON.stringify(field.directives) :
        ""},${field.childShape !== undefined ?
        field.childShape.toString() :
        ""})`;
}
