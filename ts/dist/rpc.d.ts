/// <reference types="node" />
import EventEmitter from "eventemitter3";
import { Account, PublicKey, ConfirmOptions, Transaction, TransactionSignature, TransactionInstruction, Commitment } from "@solana/web3.js";
import Provider from "./provider";
import { Idl } from "./idl";
import Coder from "./coder";
/**
 * Dynamically generated rpc namespace.
 */
export interface Rpcs {
    [key: string]: RpcFn;
}
/**
 * Dynamically generated instruction namespace.
 */
export interface Ixs {
    [key: string]: IxFn;
}
/**
 * Dynamically generated transaction namespace.
 */
export interface Txs {
    [key: string]: TxFn;
}
/**
 * Accounts is a dynamically generated object to fetch any given account
 * of a program.
 */
export interface Accounts {
    [key: string]: AccountFn;
}
/**
 * RpcFn is a single rpc method generated from an IDL.
 */
export declare type RpcFn = (...args: any[]) => Promise<TransactionSignature>;
/**
 * Ix is a function to create a `TransactionInstruction` generated from an IDL.
 */
export declare type IxFn = IxProps & ((...args: any[]) => any);
declare type IxProps = {
    accounts: (ctx: RpcAccounts) => any;
};
/**
 * Tx is a function to create a `Transaction` generate from an IDL.
 */
export declare type TxFn = (...args: any[]) => Transaction;
/**
 * Account is a function returning a deserialized account, given an address.
 */
export declare type AccountFn<T = any> = AccountProps & ((address: PublicKey) => T);
/**
 * Deserialized account owned by a program.
 */
export declare type ProgramAccount<T = any> = {
    publicKey: PublicKey;
    account: T;
};
/**
 * Non function properties on the acccount namespace.
 */
declare type AccountProps = {
    size: number;
    all: (filter?: Buffer) => Promise<ProgramAccount<any>[]>;
    subscribe: (address: PublicKey, commitment?: Commitment) => EventEmitter;
    unsubscribe: (address: PublicKey) => void;
    createInstruction: (account: Account) => Promise<TransactionInstruction>;
};
/**
 * Options for an RPC invocation.
 */
export declare type RpcOptions = ConfirmOptions;
/**
 * Dynamic object representing a set of accounts given to an rpc/ix invocation.
 * The name of each key should match the name for that account in the IDL.
 */
declare type RpcAccounts = {
    [key: string]: PublicKey | RpcAccounts;
};
export declare type State = () => Promise<any> | {
    address: () => Promise<PublicKey>;
    rpc: Rpcs;
    instruction: Ixs;
    subscribe: (address: PublicKey, commitment?: Commitment) => EventEmitter;
    unsubscribe: (address: PublicKey) => void;
};
/**
 * RpcFactory builds an Rpcs object for a given IDL.
 */
export declare class RpcFactory {
    /**
     * build dynamically generates RPC methods.
     *
     * @returns an object with all the RPC methods attached.
     */
    static build(idl: Idl, coder: Coder, programId: PublicKey, provider: Provider): [Rpcs, Ixs, Txs, Accounts, State];
    private static buildState;
    private static buildIx;
    private static accountsArray;
    private static buildRpc;
    private static buildTx;
    private static buildAccounts;
}
export {};
//# sourceMappingURL=rpc.d.ts.map