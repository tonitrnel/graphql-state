import { ObjectFetcher } from "graphql-ts-client-api";
import { EntityChangeEvent } from "..";
import { EntityEvictEvent } from "../entities/EntityEvent";
import { SchemaType } from "../meta/SchemaType";
export interface StateManager<TSchema extends SchemaType> {
    readonly undoManager: UndoManager;
    transaction<TResult>(callback: (ts: TransactionStatus) => TResult): TResult;
    save<TName extends (keyof TSchema["entities"] & string) | "Query" | "Mutation", T extends object, TVariables extends object = {}>(fetcher: ObjectFetcher<TName, T, any>, obj: T, variables?: TVariables): void;
    save<TName extends keyof TSchema["entities"] & string, T extends object, TVariables extends object = {}>(fetcher: ObjectFetcher<TName, T, any>, objs: readonly T[], variables?: TVariables): void;
    delete<TName extends keyof TSchema["entities"] & string>(typeName: TName, id: TSchema["entities"][TName][" $id"] | undefined): void;
    delete<TName extends keyof TSchema["entities"] & string>(typeName: TName, ids: ReadonlyArray<TSchema["entities"][TName][" $id"] | undefined> | undefined): void;
    evict(typeName: "Query"): void;
    evict<TName extends keyof TSchema["entities"] & string>(typeName: TName, id: TSchema["entities"][TName][" $id"] | undefined): void;
    evict<TName extends keyof TSchema["entities"] & string>(typeName: TName, ids: ReadonlyArray<TSchema["entities"][TName][" $id"] | undefined> | undefined): void;
    addEntityEvictListener(listener: (e: EntityEvictEvent) => void): void;
    removeEntityEvictListener(listener: (e: EntityEvictEvent) => void): void;
    addEntityEvictListeners(listeners: {
        readonly [TName in keyof TSchema["entities"] & string]?: (e: TSchema["entities"][TName][" $evictEvent"]) => void;
    }): void;
    removeEntityEvictListeners(listeners: {
        readonly [TName in keyof TSchema["entities"] & string]?: (e: TSchema["entities"][TName][" $evictEvent"]) => void;
    }): void;
    addEntityChangeListener(listener: (e: EntityChangeEvent) => void): void;
    removeEntityChangeListener(listener: (e: EntityChangeEvent) => void): void;
    addEntityChangeListeners(listeners: {
        readonly [TName in keyof TSchema["entities"] & string]?: (e: TSchema["entities"][TName][" $changeEvent"]) => void;
    }): void;
    removeEntityChangeListeners(listeners: {
        readonly [TName in keyof TSchema["entities"] & string]?: (e: TSchema["entities"][TName][" $changeEvent"]) => void;
    }): void;
    suspendBidirectionalAssociationManagement<T>(action: () => T): T;
}
export interface UndoManager {
    readonly isUndoable: boolean;
    readonly isRedoable: boolean;
    undo(): void;
    redo(): void;
    clear(): void;
}
export interface TransactionStatus {
    setRollbackOnly(): void;
}
export declare type RecursivePartial<T> = T extends object ? {
    [P in keyof T]?: RecursivePartial<T[P]>;
} : T;
