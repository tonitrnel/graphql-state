"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssociationValue = void 0;
const Record_1 = require("../Record");
class AssociationValue {
    constructor(entityManager, association, args) {
        this.association = association;
        this.args = args;
        this.gcVisited = false;
        const deps = association.field.associationProperties.dependencies(args === null || args === void 0 ? void 0 : args.filterVariables);
        if (deps === undefined || deps === null || deps.length !== 0) {
            this.dependencies = deps === undefined || deps === null ? "all" : new Set(deps);
            entityManager.addAssociationValueObserver(this);
        }
    }
    releaseOldReference(entityManager, oldReference) {
        const self = this.association.record;
        if (oldReference !== undefined) {
            oldReference.backReferences.remove(this.association.field, this.args, self);
            this.association.unlink(entityManager, oldReference, this.args, true);
            if (!entityManager.isBidirectionalAssociationManagementSuspending) {
                const oppositeField = this.association.field.oppositeField;
                if (oppositeField !== undefined) {
                    if (oldReference) {
                        oldReference.unlink(entityManager, oppositeField, self);
                    }
                }
            }
        }
    }
    retainNewReference(entityManager, newReference) {
        const self = this.association.record;
        if (newReference !== undefined) {
            newReference.backReferences.add(this.association.field, this.args, self);
            this.association.link(entityManager, newReference, this.args, true);
            if (!entityManager.isBidirectionalAssociationManagementSuspending) {
                const oppositeField = this.association.field.oppositeField;
                if (oppositeField !== undefined) {
                    newReference.link(entityManager, oppositeField, self);
                    if (oppositeField.category === "REFERENCE" && !newReference.hasAssociation(oppositeField)) {
                        entityManager.forEach(this.association.field.declaringType.name, record => {
                            if (record.id !== this.association.record.id &&
                                record.contains(this.association.field, undefined, newReference, true)) {
                                record.unlink(entityManager, this.association.field, newReference);
                            }
                        });
                    }
                }
            }
        }
    }
    dispose(entityManager) {
        if (this.dependencies !== undefined) {
            entityManager.removeAssociationValueObserver(this);
        }
    }
    onEntityEvict(entityManager, e) {
        if (!e.causedByGC) {
            const targetType = this.association.field.targetType;
            const actualType = entityManager.schema.typeMap.get(e.typeName);
            if (targetType.isAssignableFrom(actualType)) {
                if (e.evictedType === 'row' || this.isTargetChanged(targetType, e.evictedKeys)) {
                    this.evict(entityManager);
                }
            }
        }
    }
    onEntityChange(entityManager, e) {
        var _a, _b;
        const declaredTypeName = this.association.field.declaringType.name;
        const targetType = this.association.field.targetType;
        const actualType = entityManager.schema.typeMap.get(e.typeName);
        if (targetType.isAssignableFrom(actualType) &&
            e.changedType === "update" &&
            this.isTargetChanged(targetType, e.changedKeys)) {
            if (declaredTypeName === "Query" && this.association.field.isContainingConfigured) {
                const ref = entityManager.findRefById(targetType.name, e.id);
                if ((ref === null || ref === void 0 ? void 0 : ref.value) !== undefined) {
                    const result = (_a = this.association.field.associationProperties) === null || _a === void 0 ? void 0 : _a.contains(new Record_1.FlatRowImpl(this.association.record), (_b = this.args) === null || _b === void 0 ? void 0 : _b.filterVariables);
                    if (result === true) {
                        // Cannot invoke "this.link" directly
                        this.association.link(entityManager, ref.value, this.args);
                        return;
                    }
                    if (result === false) {
                        // Cannot invoke "this.unlink" directly
                        this.association.unlink(entityManager, ref.value, this.args);
                        return;
                    }
                }
            }
            this.evict(entityManager);
        }
    }
    isTargetChanged(targetType, keys) {
        var _a, _b;
        for (const key of keys) {
            if (typeof key === "string" && ((_a = targetType.fieldMap.get(key)) === null || _a === void 0 ? void 0 : _a.category) === "SCALAR") {
                if (this.dependencies === "all") {
                    return true;
                }
                if (((_b = this.dependencies) === null || _b === void 0 ? void 0 : _b.has(key)) === true) {
                    return true;
                }
            }
        }
    }
    evict(entityManager) {
        this.association.evict(entityManager, this.args, false);
    }
    get isLinkOptimizable() {
        var _a, _b;
        const paginationInfo = (_a = this.args) === null || _a === void 0 ? void 0 : _a.paginationInfo;
        if ((paginationInfo === null || paginationInfo === void 0 ? void 0 : paginationInfo.style) === "page") {
            return false;
        }
        if (paginationInfo !== undefined && ((_b = this.association.field.associationProperties) === null || _b === void 0 ? void 0 : _b.range) === undefined) {
            return false;
        }
        return true;
    }
}
exports.AssociationValue = AssociationValue;
