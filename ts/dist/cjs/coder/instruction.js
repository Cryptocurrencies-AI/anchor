"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstructionCoder = exports.SIGHASH_GLOBAL_NAMESPACE = exports.SIGHASH_STATE_NAMESPACE = void 0;
const camelcase_1 = __importDefault(require("camelcase"));
const borsh = __importStar(require("@project-serum/borsh"));
const idl_1 = require("./idl");
const common_1 = require("./common");
/**
 * Namespace for state method function signatures.
 */
exports.SIGHASH_STATE_NAMESPACE = "state";
/**
 * Namespace for global instruction function signatures (i.e. functions
 * that aren't namespaced by the state or any of its trait implementations).
 */
exports.SIGHASH_GLOBAL_NAMESPACE = "global";
/**
 * Encodes and decodes program instructions.
 */
class InstructionCoder {
    constructor(idl) {
        this.ixLayout = InstructionCoder.parseIxLayout(idl);
    }
    /**
     * Encodes a program instruction.
     */
    encode(ixName, ix) {
        return this._encode(exports.SIGHASH_GLOBAL_NAMESPACE, ixName, ix);
    }
    /**
     * Encodes a program state instruction.
     */
    encodeState(ixName, ix) {
        return this._encode(exports.SIGHASH_STATE_NAMESPACE, ixName, ix);
    }
    _encode(nameSpace, ixName, ix) {
        const buffer = Buffer.alloc(1000); // TODO: use a tighter buffer.
        const methodName = camelcase_1.default(ixName);
        const len = this.ixLayout.get(methodName).encode(ix, buffer);
        const data = buffer.slice(0, len);
        return Buffer.concat([common_1.sighash(nameSpace, ixName), data]);
    }
    static parseIxLayout(idl) {
        const stateMethods = idl.state ? idl.state.methods : [];
        const ixLayouts = stateMethods
            .map((m) => {
            let fieldLayouts = m.args.map((arg) => {
                return idl_1.IdlCoder.fieldLayout(arg, idl.types);
            });
            const name = camelcase_1.default(m.name);
            return [name, borsh.struct(fieldLayouts, name)];
        })
            .concat(idl.instructions.map((ix) => {
            let fieldLayouts = ix.args.map((arg) => idl_1.IdlCoder.fieldLayout(arg, idl.types));
            const name = camelcase_1.default(ix.name);
            return [name, borsh.struct(fieldLayouts, name)];
        }));
        // @ts-ignore
        return new Map(ixLayouts);
    }
}
exports.InstructionCoder = InstructionCoder;
//# sourceMappingURL=instruction.js.map