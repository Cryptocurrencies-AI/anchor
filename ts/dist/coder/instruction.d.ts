/// <reference types="node" />
import { Idl } from "../idl";
/**
 * Namespace for state method function signatures.
 */
export declare const SIGHASH_STATE_NAMESPACE = "state";
/**
 * Namespace for global instruction function signatures (i.e. functions
 * that aren't namespaced by the state or any of its trait implementations).
 */
export declare const SIGHASH_GLOBAL_NAMESPACE = "global";
/**
 * Encodes and decodes program instructions.
 */
export declare class InstructionCoder {
    /**
     * Instruction args layout. Maps namespaced method
     */
    private ixLayout;
    constructor(idl: Idl);
    /**
     * Encodes a program instruction.
     */
    encode(ixName: string, ix: any): Buffer;
    /**
     * Encodes a program state instruction.
     */
    encodeState(ixName: string, ix: any): Buffer;
    private _encode;
    private static parseIxLayout;
}
//# sourceMappingURL=instruction.d.ts.map