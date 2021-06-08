import BN from "bn.js";
import * as web3 from "@solana/web3.js";
import Provider, { NodeWallet as Wallet } from "./provider";
import { Program } from "./program";
import Coder from "./coder";
import workspace from "./workspace";
import utils from "./utils";
let _provider = null;
function setProvider(provider) {
    _provider = provider;
}
function getProvider() {
    if (_provider === null) {
        return Provider.local();
    }
    return _provider;
}
export { workspace, Program, Coder, setProvider, getProvider, Provider, BN, web3, utils, Wallet, };
//# sourceMappingURL=index.js.map