import { Fetcher } from "graphql-ts-client-api";
import { Loadable } from "../state/impl/StateValue";
import { EntityManager } from "./EntityManager";
import { RuntimeShape } from "./RuntimeShape";
export declare class QueryResult {
    readonly entityManager: EntityManager;
    readonly queryArgs: QueryArgs;
    private _refCount;
    private _promise?;
    private _loadable;
    private _invalid;
    private _asyncRequestId;
    constructor(entityManager: EntityManager, queryArgs: QueryArgs);
    retain(): this;
    release(): boolean;
    get promise(): Promise<any>;
    get loadable(): Loadable;
}
export declare class QueryArgs {
    readonly fetcher: Fetcher<string, object, object>;
    readonly id?: any;
    readonly variables?: any;
    private _shape;
    constructor(fetcher: Fetcher<string, object, object>, id?: any, variables?: any);
    get shape(): RuntimeShape;
}
