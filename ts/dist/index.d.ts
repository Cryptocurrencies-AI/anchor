import BN from "bn.js";
import * as web3 from "@solana/web3.js";
import Provider, { NodeWallet as Wallet } from "./provider";
import { Program } from "./program";
import Coder from "./coder";
import { Idl } from "./idl";
import workspace from "./workspace";
import utils from "./utils";
import { ProgramAccount } from "./rpc";
declare function setProvider(provider: Provider): void;
declare function getProvider(): Provider;
export { workspace, Program, ProgramAccount, Coder, setProvider, getProvider, Provider, BN, web3, Idl, utils, Wallet, };
//# sourceMappingURL=index.d.ts.map