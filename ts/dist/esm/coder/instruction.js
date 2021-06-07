import camelCase from "camelcase";
import * as borsh from "@project-serum/borsh";
import { IdlCoder } from "./idl";
import { sighash } from "./common";
/**
 * Namespace for state method function signatures.
 */
export const SIGHASH_STATE_NAMESPACE = "state";
/**
 * Namespace for global instruction function signatures (i.e. functions
 * that aren't namespaced by the state or any of its trait implementations).
 */
export const SIGHASH_GLOBAL_NAMESPACE = "global";
/**
 * Encodes and decodes program instructions.
 */
export class InstructionCoder {
    constructor(idl) {
        this.ixLayout = InstructionCoder.parseIxLayout(idl);
    }
    /**
     * Encodes a program instruction.
     */
    encode(ixName, ix) {
        return this._encode(SIGHASH_GLOBAL_NAMESPACE, ixName, ix);
    }
    /**
     * Encodes a program state instruction.
     */
    encodeState(ixName, ix) {
        return this._encode(SIGHASH_STATE_NAMESPACE, ixName, ix);
    }
    _encode(nameSpace, ixName, ix) {
        const buffer = Buffer.alloc(1000); // TODO: use a tighter buffer.
        const methodName = camelCase(ixName);
        const len = this.ixLayout.get(methodName).encode(ix, buffer);
        const data = buffer.slice(0, len);
        return Buffer.concat([sighash(nameSpace, ixName), data]);
    }
    static parseIxLayout(idl) {
        const stateMethods = idl.state ? idl.state.methods : [];
        const ixLayouts = stateMethods
            .map((m) => {
            let fieldLayouts = m.args.map((arg) => {
                return IdlCoder.fieldLayout(arg, idl.types);
            });
            const name = camelCase(m.name);
            return [name, borsh.struct(fieldLayouts, name)];
        })
            .concat(idl.instructions.map((ix) => {
            let fieldLayouts = ix.args.map((arg) => IdlCoder.fieldLayout(arg, idl.types));
            const name = camelCase(ix.name);
            return [name, borsh.struct(fieldLayouts, name)];
        }));
        // @ts-ignore
        return new Map(ixLayouts);
    }
}
//# sourceMappingURL=instruction.js.map