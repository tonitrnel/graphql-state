"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateScope = exports.StateManagerProvider = exports.makeManagedObjectHooks = exports.useStateAccessor = exports.useStateValue = exports.useStateManager = exports.makeStateFactory = exports.newConfiguration = void 0;
var ConfigurationImpl_1 = require("./meta/impl/ConfigurationImpl");
Object.defineProperty(exports, "newConfiguration", { enumerable: true, get: function () { return ConfigurationImpl_1.newConfiguration; } });
var State_1 = require("./state/State");
Object.defineProperty(exports, "makeStateFactory", { enumerable: true, get: function () { return State_1.makeStateFactory; } });
var StateHook_1 = require("./state/StateHook");
Object.defineProperty(exports, "useStateManager", { enumerable: true, get: function () { return StateHook_1.useStateManager; } });
Object.defineProperty(exports, "useStateValue", { enumerable: true, get: function () { return StateHook_1.useStateValue; } });
Object.defineProperty(exports, "useStateAccessor", { enumerable: true, get: function () { return StateHook_1.useStateAccessor; } });
Object.defineProperty(exports, "makeManagedObjectHooks", { enumerable: true, get: function () { return StateHook_1.makeManagedObjectHooks; } });
var StateManagerProvider_1 = require("./state/StateManagerProvider");
Object.defineProperty(exports, "StateManagerProvider", { enumerable: true, get: function () { return StateManagerProvider_1.StateManagerProvider; } });
var StateScope_1 = require("./state/StateScope");
Object.defineProperty(exports, "StateScope", { enumerable: true, get: function () { return StateScope_1.StateScope; } });
