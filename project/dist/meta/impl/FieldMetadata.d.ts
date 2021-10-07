import { FetchableField } from "graphql-ts-client-api";
import { TypeMetadata } from "./TypeMetdata";
export declare class FieldMetadata {
    readonly declaringType: TypeMetadata;
    readonly name: string;
    readonly category: FieldMetadataCategory;
    readonly fullName: string;
    private _inversed;
    private _deleteOperation?;
    private _connectionType?;
    private _edgeType?;
    private _targetType?;
    private _oppositeField?;
    constructor(declaringType: TypeMetadata, field: FetchableField);
    get deleteOperation(): "CASCADE" | "SET_UNDEFINED" | undefined;
    get isInversed(): boolean;
    get isAssociation(): boolean;
    get connectionType(): TypeMetadata | undefined;
    get edgeType(): TypeMetadata | undefined;
    get targetType(): TypeMetadata | undefined;
    get oppositeField(): FieldMetadata | undefined;
    setOppositeFieldName(oppositeFieldName: string): void;
    " $resolveInversedAssociation"(): void;
}
export declare type FieldMetadataCategory = "ID" | "SCALAR" | "REFERENCE" | "LIST" | "CONNECTION";
export interface FieldMetadataOptions {
    readonly undefinable?: boolean;
    readonly deleteOperation?: "CASCADE" | "SET_UNDEFINED";
    readonly connectionTypeName?: string;
    readonly edgeTypeName?: string;
    readonly targetTypeName?: string;
    readonly mappedBy?: string;
}
