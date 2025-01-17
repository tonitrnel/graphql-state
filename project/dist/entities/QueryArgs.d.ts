import { ObjectFetcher } from "graphql-ts-client-api";
import { SchemaMetadata } from "../meta/impl/SchemaMetadata";
import { OptionArgs } from "../state/impl/Args";
import { PaginationStyle } from "../state/StateHook";
import { RuntimeShape } from "./RuntimeShape";
export declare class QueryArgs {
    readonly shape: RuntimeShape;
    readonly fetcher: ObjectFetcher<string, object, object>;
    readonly pagination: Pagination | undefined;
    readonly ids: ReadonlyArray<any> | undefined;
    readonly optionArgs: OptionArgs | undefined;
    private _key;
    private _hasPaginationInfo;
    private _withPaginationInfo?;
    private _withoutPaginationInfo?;
    private constructor();
    get key(): string;
    static create(fetcher: ObjectFetcher<string, object, object>, pagination?: {
        readonly schema: SchemaMetadata;
        readonly loadMode: "initial" | "next" | "previous";
    }, ids?: ReadonlyArray<any>, optionArgs?: OptionArgs): QueryArgs;
    newArgs(ids: ReadonlyArray<any>): QueryArgs;
    contains(args: QueryArgs): boolean;
    variables(variables: any): QueryArgs;
    withPaginationInfo(): QueryArgs;
    withoutPaginationInfo(): QueryArgs;
}
export interface Pagination {
    readonly loadMode: "initial" | "next" | "previous";
    readonly windowId: string;
    readonly connName: string;
    readonly connAlias?: string;
    readonly style: PaginationStyle;
    readonly initialSize: number;
    readonly pageSize: number;
}
export interface PaginationInfo {
    windowId: string;
    style: PaginationStyle;
    initialSize: number;
}
