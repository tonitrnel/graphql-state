"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecordManager = void 0;
const Record_1 = require("./Record");
class RecordManager {
    constructor(entityManager, type) {
        this.entityManager = entityManager;
        this.type = type;
        this.fieldManagerMap = new Map();
        this.recordMap = new Map();
    }
    initializeOtherManagers() {
        if (this.type.superType !== undefined) {
            this.superManager = this.entityManager.recordManager(this.type.superType.name);
        }
        for (const [fieldName, field] of this.type.fieldMap) {
            if (field.category !== "ID") {
                this.fieldManagerMap.set(fieldName, this.entityManager.recordManager(field.declaringType.name));
            }
        }
    }
    findRefById(id) {
        const record = this.recordMap.get(id);
        if (record === undefined) {
            return undefined;
        }
        return record.isDeleted ? {} : { value: record };
    }
    saveId(id) {
        var _a;
        const ctx = this.entityManager.modificationContext;
        let record = this.recordMap.get(id);
        if (record !== undefined) {
            record.undelete();
        }
        else {
            record = new Record_1.Record(this.type, id);
            this.recordMap.set(id, record);
            ctx.insert(record);
        }
        (_a = this.superManager) === null || _a === void 0 ? void 0 : _a.saveId(id);
        return record;
    }
    save(shape, obj) {
        var _a, _b, _c;
        if (typeof obj !== "object" || Array.isArray(obj)) {
            throw new Error("obj can only be plain object");
        }
        let idFieldName;
        let id;
        if (shape.typeName === 'Query') {
            idFieldName = undefined;
            id = Record_1.QUERY_OBJECT_ID;
        }
        else {
            idFieldName = this.type.idField.name;
            const idShapeField = shape.fieldMap.get(idFieldName);
            if (idShapeField === undefined) {
                throw new Error(`Cannot save the object whose type is "${shape.typeName}" without id`);
            }
            id = obj[(_a = idShapeField.alias) !== null && _a !== void 0 ? _a : idShapeField.name];
            if (id === undefined || id === null) {
                throw new Error(`Cannot save the object whose type is "${shape.typeName}" without id`);
            }
        }
        const fieldMap = this.type.fieldMap;
        for (const [, shapeField] of shape.fieldMap) {
            if (shapeField.name !== idFieldName) {
                const field = fieldMap.get(shapeField.name);
                if (field === undefined) {
                    throw new Error(`Cannot set the non-existing field "${shapeField.name}" for type "${this.type.name}"`);
                }
                const manager = (_b = this.fieldManagerMap.get(shapeField.name)) !== null && _b !== void 0 ? _b : this;
                let value = obj[(_c = shapeField.alias) !== null && _c !== void 0 ? _c : shapeField.name];
                if (value === null) {
                    value = undefined;
                }
                manager.set(id, field, shapeField.args, value);
                if (value !== undefined && shapeField.childShape !== undefined) {
                    switch (field.category) {
                        case "REFERENCE":
                            this
                                .entityManager
                                .recordManager(shapeField.childShape.typeName)
                                .save(shapeField.childShape, value);
                            break;
                        case "LIST":
                            if (Array.isArray(value)) {
                                const associationRecordManager = this.entityManager.recordManager(shapeField.childShape.typeName);
                                for (const element of value) {
                                    associationRecordManager.save(shapeField.childShape, element);
                                }
                            }
                            break;
                        case "CONNECTION":
                            const edges = value.edges;
                            if (Array.isArray(edges)) {
                                const nodeShape = shapeField.nodeShape;
                                const associationRecordManager = this.entityManager.recordManager(nodeShape.typeName);
                                for (const edge of edges) {
                                    associationRecordManager.save(nodeShape, edge.node);
                                }
                            }
                            break;
                    }
                }
            }
        }
    }
    delete(id) {
        var _a;
        let record = this.recordMap.get(id);
        if (record !== undefined) {
            this.entityManager.modificationContext.delete(record);
            record.delete(this.entityManager);
        }
        else {
            record = new Record_1.Record(this.type, id, true);
            this.recordMap.set(id, record);
        }
        (_a = this.superManager) === null || _a === void 0 ? void 0 : _a.delete(id);
    }
    evict(id) {
        let record = this.recordMap.get(id);
        if (record !== undefined) {
            this.entityManager.modificationContext.evict(record);
            this.recordMap.delete(id);
            record.dispose(this.entityManager);
        }
    }
    forEach(visitor) {
        for (const [, record] of this.recordMap) {
            if (visitor(record) === false) {
                break;
            }
        }
    }
    set(id, field, args, value) {
        const record = this.saveId(id);
        record.set(this.entityManager, field, args, value);
    }
}
exports.RecordManager = RecordManager;
