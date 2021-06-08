import { PublicKey } from "@solana/web3.js";
import Provider from "./provider";
import { Idl } from "./idl";
import Coder from "./coder";
import { Rpcs, Ixs, Txs, Accounts, State } from "./rpc";
/**
 * Program is the IDL deserialized representation of a Solana program.
 */
export declare class Program {
    /**
     * Address of the program.
     */
    readonly programId: PublicKey;
    /**
     * IDL describing this program's interface.
     */
    readonly idl: Idl;
    /**
     * Async functions to invoke instructions against a Solana priogram running
     * on a cluster.
     */
    readonly rpc: Rpcs;
    /**
     * Async functions to fetch deserialized program accounts from a cluster.
     */
    readonly account: Accounts;
    /**
     * Functions to build `TransactionInstruction` objects.
     */
    readonly instruction: Ixs;
    /**
     * Functions to build `Transaction` objects.
     */
    readonly transaction: Txs;
    /**
     * Coder for serializing rpc requests.
     */
    readonly coder: Coder;
    /**
     * Object with state account accessors and rpcs.
     */
    readonly state: State;
    /**
     * Wallet and network provider.
     */
    readonly provider: Provider;
    constructor(idl: Idl, programId: PublicKey, provider?: Provider);
    /**
     * Generates a Program client by fetching the IDL from chain.
     */
    static at(programId: PublicKey, provider?: Provider): Promise<Program>;
    /**
     * Fetches an idl from the blockchain.
     */
    static fetchIdl(programId: PublicKey, provider?: Provider): Promise<any>;
    /**
     * Invokes the given callback everytime the given event is emitted.
     */
    addEventListener<T>(eventName: string, callback: (event: T, slot: number) => void): Promise<void>;
    removeEventListener(listener: number): Promise<void>;
}
//# sourceMappingURL=program.d.ts.map