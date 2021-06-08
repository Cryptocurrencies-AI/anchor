import { Connection, Account, PublicKey, Transaction, TransactionSignature, ConfirmOptions } from "@solana/web3.js";
export default class Provider {
    readonly connection: Connection;
    readonly wallet: Wallet;
    readonly opts: ConfirmOptions;
    constructor(connection: Connection, wallet: Wallet, opts: ConfirmOptions);
    static defaultOptions(): ConfirmOptions;
    static local(url?: string, opts?: ConfirmOptions): Provider;
    static env(): Provider;
    send(tx: Transaction, signers?: Array<Account | undefined>, opts?: ConfirmOptions): Promise<TransactionSignature>;
    sendAll(reqs: Array<SendTxRequest>, opts?: ConfirmOptions): Promise<Array<TransactionSignature>>;
}
export declare type SendTxRequest = {
    tx: Transaction;
    signers: Array<Account | undefined>;
};
export interface Wallet {
    signTransaction(tx: Transaction): Promise<Transaction>;
    signAllTransactions(txs: Transaction[]): Promise<Transaction[]>;
    publicKey: PublicKey;
}
export declare class NodeWallet implements Wallet {
    readonly payer: Account;
    constructor(payer: Account);
    static local(): NodeWallet;
    signTransaction(tx: Transaction): Promise<Transaction>;
    signAllTransactions(txs: Transaction[]): Promise<Transaction[]>;
    get publicKey(): PublicKey;
}
//# sourceMappingURL=provider.d.ts.map