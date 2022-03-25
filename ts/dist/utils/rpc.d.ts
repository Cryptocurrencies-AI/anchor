/// <reference types="node" />
import { PublicKey, AccountInfo, Connection } from "@solana/web3.js";
export declare function getMultipleAccounts(connection: Connection, publicKeys: PublicKey[]): Promise<Array<null | {
    publicKey: PublicKey;
    account: AccountInfo<Buffer>;
}>>;
//# sourceMappingURL=rpc.d.ts.map