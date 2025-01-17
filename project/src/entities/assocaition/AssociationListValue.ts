import { PositionType, FlatRow } from "../../meta/Configuration";
import { EntityManager } from "../EntityManager";
import { objectWithOnlyId, Record } from "../Record";
import { AssociationValue } from "./AssocaitionValue";
import { toRecordMap } from "./util";

export class AssociationListValue extends AssociationValue {

    private elements?: Array<Record>;

    private indexMap?: Map<any, number>;

    getAsObject(): ReadonlyArray<any> | undefined {
        return this.elements?.map(objectWithOnlyId);
    }

    get(): ReadonlyArray<Record> {
        return this.elements ?? [];
    }

    set(
        entityManager: EntityManager, 
        value: ReadonlyArray<any>
    ) {
        const list = value ?? [];
        this.validate(list);
        if (this.valueEquals(list)) {
            return;
        }
        const oldValueForTriggger = this.getAsObject();

        const oldIndexMap = this.indexMap;
        const association = this.association;
        const newIndexMap = new Map<any, number>();
        const newElements: Array<Record> = [];
        if (Array.isArray(list)) {
            const idFieldName = association.field.targetType!.idField.name;
            for (const item of list) {
                if (item === undefined || item === null) {
                    throw new Error(`Cannot add undfined/null element into ${association.field.fullName}`);
                }
                const newElement = entityManager.saveId(
                    item["__typename"] ?? association.field.targetType!.name, 
                    item[idFieldName]
                );
                if (!newIndexMap.has(newElement.id)) {
                    newElements.push(newElement);
                    newIndexMap.set(newElement.id, newIndexMap.size);
                }
            }
        }

        if (this.elements !== undefined) {
            for (const oldElement of this.elements) {
                if (!newIndexMap.has(oldElement.id)) {
                    this.releaseOldReference(entityManager, oldElement);
                }
            }
        }

        this.elements = newElements;
        this.indexMap = newIndexMap.size !== 0 ? newIndexMap : undefined;

        for (const newElement of newElements) {
            if (oldIndexMap?.has(newElement.id) !== true) {
                this.retainNewReference(entityManager, newElement);
            }
        }

        entityManager.modificationContext.set(
            this.association.record, 
            association.field.name, 
            this.args, 
            oldValueForTriggger, 
            this.getAsObject()
        );
    }

    link(
        entityManager: EntityManager, 
        targets: ReadonlyArray<Record>
    ) {
        const elements = this.elements !== undefined ? [...this.elements] : [];
        const indexMap = this.indexMap;
        const linkMap = toRecordMap(targets);
        const appender = new Appender(this);
        for (const record of linkMap.values()) {
            if (indexMap?.has(record.id) !== true) {
                try {
                    appender.appendTo(elements, record);
                } catch (ex) {
                    if (!ex[" $evict"]) {
                        throw ex;
                    }
                    this.evict(entityManager);
                    return;
                }
            }
        }
        if (elements.length !== this.elements?.length ?? 0) {
            this.association.set(
                entityManager,
                this.args,
                elements.map(objectWithOnlyId)
            );
        }
    }

    unlink(
        entityManager: EntityManager, 
        targets: ReadonlyArray<Record>
    ) {
        const elements = this.elements !== undefined ? [...this.elements] : [];
        const indexMap = this.indexMap;
        const unlinkMap = toRecordMap(targets);
        for (const record of unlinkMap.values()) {
            const index = indexMap?.get(record.id);
            if (index !== undefined) {
                elements.splice(index, 1);
            }
        }
        if (elements.length !== this.elements?.length ?? 0) {
            this.association.set(
                entityManager,
                this.args,
                elements.map(objectWithOnlyId)
            );
        }
    }

    contains(target: Record): boolean {
        return this.indexMap?.has(target.id) === true;
    }

    private validate(
        newList: ReadonlyArray<any> | undefined
    ) {
        if (newList !== undefined && newList !== null) {
            if (!Array.isArray(newList)) {
                throw new Error(`The assocaition ${this.association.field.fullName} can only accept array`);
            }
            const idFieldName = this.association.field.targetType!.idField.name;
            for (const element of newList) {
                if (element === undefined) {
                    throw new Error(`The element of the array "${this.association.field.fullName}" cannot be undefined or null`);
                }
                if (element[idFieldName] === undefined || element[idFieldName] === null) {
                    throw new Error(`The element of the array "${this.association.field.fullName}" must support id field "${idFieldName}"`);
                }
            }
        }
    }

    private valueEquals(
        newList: ReadonlyArray<any>
    ): boolean {
        if (this.elements === undefined || this.elements.length !== newList.length) {
            return false;
        }
        const idFieldName = this.association.field.targetType!.idField.name;
        for (let i = (newList?.length ?? 0) - 1; i >= 0; --i) {
            const oldId = this.elements !== undefined ? 
                this.elements[i].id :
                undefined
            ;
            const newId = newList !== undefined ? 
                newList[i][idFieldName] : 
                undefined;
            if (oldId !== newId) {
                return false;
            }
        }
        return true;
    }
}

class Appender {

    private position: (
        row: FlatRow<any>,
        rows: ReadonlyArray<FlatRow<any>>,
        paginationDirection?: "forward" | "backward"
    ) => PositionType | undefined;

    private direction?: "forward" | "backward";

    constructor(owner: AssociationListValue) {
        this.position = owner.association.field.associationProperties!.position;
        const style = owner.args?.paginationInfo?.style;
        if (style === "forward") {
            this.direction = "forward";
        } else if (style === "backward") {
            this.direction = "backward";
        }
    }

    appendTo(
        newElements: Array<Record>, 
        newElement: Record
    ) {
        const pos = newElements.length === 0 ? 
            0 : 
            this.position(
                newElement.toRow(), 
                newElements.map(e => e.toRow()), 
                this.direction
            );
        if (pos === undefined) {
            throw { " $evict": true };
        }
        const index = pos === "start" ? 0 : pos === "end" ? newElements.length : pos;
        if (index >= newElements.length) {
            newElements.push(newElement);
        } else {
            newElements.splice(Math.max(0, index), 0, newElement);
        }
    }
}