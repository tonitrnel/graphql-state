import { StateManager } from "../state/StateManager";
import { SchemaMetadata } from "./impl/SchemaMetadata";
import { ObjectType, ConfigurationSchemaTypes } from "./SchemaTypes";
import { TypeConfiguration } from "./TypeConfiguration";

export interface Configuration<TConfigurationSchema extends ConfigurationSchemaTypes> {

    addObjectType<
        TObjectType extends ObjectType, 
        TName extends TObjectType["__typename"]
    >(
        objectTypeRef: TypeRef<TObjectType, TName>,
    ): Configuration<
        TConfigurationSchema & 
        { 
            objectTypes: { 
                readonly [key in TName]: TObjectType & 
                {readonly __typename: TName}
            }
        }
    >;

    addConnectionType<TObjectType extends ObjectType, TName extends string>(
        objectTypeRef: TypeRef<TObjectType, TName>
    ): Configuration<
        TConfigurationSchema & 
        { collectionTypes: { readonly [key in TName]: TObjectType}}
    >;

    addEdgeType<TObjectType extends ObjectType, TName extends string>(
        objectTypeRef: TypeRef<TObjectType, TName>
    ): Configuration<
        TConfigurationSchema & 
        { edgeTypes: { readonly [key in TName]: TObjectType}}
    >;

    setObjectType<
        TTypeName extends keyof TConfigurationSchema["objectTypes"] & string
    >(
        typeName: TTypeName,
        typeConfigurer: (tc: TypeConfiguration<TConfigurationSchema, TTypeName>) => void
    ): this;

    buildStateManager(): StateManager<TConfigurationSchema["objectTypes"]>;
}

export function typeRefBuilder<
    TObjectType extends ObjectType,
>(): TypeRefBuilder<TObjectType> {
    return { named: (name: string) => ({name} as TypeRef<TObjectType, any>) } as TypeRefBuilder<TObjectType>; 
}

export interface TypeRefBuilder<TObjectType extends ObjectType> {
    
    named<TName extends TObjectType["__typename"]>(name?: TName): TypeRef<TObjectType, TName>;

    " $supressWarnings"(_1: TObjectType): void;
}

export interface TypeRef<TObjectType extends ObjectType, TName extends string> {
    
    readonly name: string;

    " $supressWarnings"(_1: TObjectType, _2: TName): void;
}
