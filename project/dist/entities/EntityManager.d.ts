import { EntityChangeEvent } from "..";
import { AbstractDataService } from "../data/AbstractDataService";
import { SchemaMetadata } from "../meta/impl/SchemaMetadata";
import { StateManagerImpl } from "../state/impl/StateManagerImpl";
import { EntityEvictEvent } from "./EntityEvent";
import { ModificationContext } from "./ModificationContext";
import { QueryArgs } from "./QueryArgs";
import { QueryResult } from "./QueryResult";
import { Record } from "./Record";
import { RecordManager } from "./RecordManager";
import { RecordRef } from "./RecordRef";
import { RuntimeShape } from "./RuntimeShape";
export declare class EntityManager {
    readonly stateManager: StateManagerImpl<any>;
    readonly schema: SchemaMetadata;
    readonly dataService: AbstractDataService;
    private _recordManagerMap;
    private _queryResultMap;
    private _evictListenerMap;
    private _changeListenerMap;
    private _ctx?;
    private _queryRecord?;
    private _mutationRecord?;
    constructor(stateManager: StateManagerImpl<any>, schema: SchemaMetadata);
    recordManager(typeName: string): RecordManager;
    findRefById(typeName: string, id: any): RecordRef | undefined;
    get modificationContext(): ModificationContext;
    modify<T>(action: () => T): T;
    save(shape: RuntimeShape, objOrArray: object | readonly object[]): void;
    delete(typeName: string, idOrArray: any): void;
    saveId(typeName: string, id: any): Record;
    retain(args: QueryArgs): QueryResult;
    release(args: QueryArgs): void;
    addEvictListener(typeName: string | undefined, listener: (e: EntityEvictEvent) => void): void;
    removeEvictListener(typeName: string | undefined, listener: (e: EntityEvictEvent) => void): void;
    private publishEvictChangeEvent;
    addChangeListener(typeName: string | undefined, listener: (e: EntityChangeEvent) => void): void;
    removeChangeListener(typeName: string | undefined, listener: (e: EntityChangeEvent) => void): void;
    private publishEntityChangeEvent;
    private linkToQuery;
}
