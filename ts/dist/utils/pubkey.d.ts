/// <reference types="node" />
import { PublicKey } from "@solana/web3.js";
export declare function createWithSeedSync(fromPublicKey: PublicKey, seed: string, programId: PublicKey): PublicKey;
export declare function createProgramAddressSync(seeds: Array<Buffer | Uint8Array>, programId: PublicKey): PublicKey;
export declare function findProgramAddressSync(seeds: Array<Buffer | Uint8Array>, programId: PublicKey): [PublicKey, number];
//# sourceMappingURL=pubkey.d.ts.map