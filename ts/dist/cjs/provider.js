"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeWallet = void 0;
const web3_js_1 = require("@solana/web3.js");
class Provider {
    constructor(connection, wallet, opts) {
        this.connection = connection;
        this.wallet = wallet;
        this.opts = opts;
    }
    static defaultOptions() {
        return {
            preflightCommitment: "recent",
            commitment: "recent",
        };
    }
    // Node only api.
    static local(url, opts) {
        opts = opts || Provider.defaultOptions();
        const connection = new web3_js_1.Connection(url || "http://localhost:8899", opts.preflightCommitment);
        const wallet = NodeWallet.local();
        return new Provider(connection, wallet, opts);
    }
    // Node only api.
    static env() {
        const process = require("process");
        const url = process.env.ANCHOR_PROVIDER_URL;
        if (url === undefined) {
            throw new Error("ANCHOR_PROVIDER_URL is not defined");
        }
        const options = Provider.defaultOptions();
        const connection = new web3_js_1.Connection(url, options.commitment);
        const wallet = NodeWallet.local();
        return new Provider(connection, wallet, options);
    }
    async send(tx, signers, opts) {
        if (signers === undefined) {
            signers = [];
        }
        if (opts === undefined) {
            opts = this.opts;
        }
        const signerKps = signers.filter((s) => s !== undefined);
        const signerPubkeys = [this.wallet.publicKey].concat(signerKps.map((s) => s.publicKey));
        tx.setSigners(...signerPubkeys);
        tx.recentBlockhash = (await this.connection.getRecentBlockhash(opts.preflightCommitment)).blockhash;
        await this.wallet.signTransaction(tx);
        signerKps.forEach((kp) => {
            tx.partialSign(kp);
        });
        const rawTx = tx.serialize();
        const txId = await web3_js_1.sendAndConfirmRawTransaction(this.connection, rawTx, opts);
        return txId;
    }
    async sendAll(reqs, opts) {
        if (opts === undefined) {
            opts = this.opts;
        }
        const blockhash = await this.connection.getRecentBlockhash(opts.preflightCommitment);
        let txs = reqs.map((r) => {
            let tx = r.tx;
            let signers = r.signers;
            if (signers === undefined) {
                signers = [];
            }
            const signerKps = signers.filter((s) => s !== undefined);
            const signerPubkeys = [this.wallet.publicKey].concat(signerKps.map((s) => s.publicKey));
            tx.setSigners(...signerPubkeys);
            tx.recentBlockhash = blockhash.blockhash;
            signerKps.forEach((kp) => {
                tx.partialSign(kp);
            });
            return tx;
        });
        const signedTxs = await this.wallet.signAllTransactions(txs);
        const sigs = [];
        for (let k = 0; k < txs.length; k += 1) {
            const tx = signedTxs[k];
            const rawTx = tx.serialize();
            sigs.push(await web3_js_1.sendAndConfirmRawTransaction(this.connection, rawTx, opts));
        }
        return sigs;
    }
}
exports.default = Provider;
class NodeWallet {
    constructor(payer) {
        this.payer = payer;
    }
    static local() {
        // const payer = new Account(
        //   Buffer.from(
        //     JSON.parse(
        //       require("fs").readFileSync(
        //         require("os").homedir() + "/.config/solana/id.json",
        //         {
        //           encoding: "utf-8",
        //         }
        //       )
        //     )
        //   )
        // );
        return new NodeWallet(null);
    }
    async signTransaction(tx) {
        tx.partialSign(this.payer);
        return tx;
    }
    async signAllTransactions(txs) {
        return txs.map((t) => {
            t.partialSign(this.payer);
            return t;
        });
    }
    get publicKey() {
        return this.payer.publicKey;
    }
}
exports.NodeWallet = NodeWallet;
//# sourceMappingURL=provider.js.map