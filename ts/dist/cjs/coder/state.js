"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stateDiscriminator = exports.StateCoder = void 0;
const js_sha256_1 = require("js-sha256");
const idl_1 = require("./idl");
class StateCoder {
    constructor(idl) {
        if (idl.state === undefined) {
            throw new Error("Idl state not defined.");
        }
        this.layout = idl_1.IdlCoder.typeDefLayout(idl.state.struct, idl.types);
    }
    async encode(name, account) {
        const buffer = Buffer.alloc(1000); // TODO: use a tighter buffer.
        const len = this.layout.encode(account, buffer);
        const disc = await stateDiscriminator(name);
        const accData = buffer.slice(0, len);
        return Buffer.concat([disc, accData]);
    }
    decode(ix) {
        // Chop off discriminator.
        const data = ix.slice(8);
        return this.layout.decode(data);
    }
}
exports.StateCoder = StateCoder;
// Calculates unique 8 byte discriminator prepended to all anchor state accounts.
async function stateDiscriminator(name) {
    return Buffer.from(js_sha256_1.sha256.digest(`state:${name}`)).slice(0, 8);
}
exports.stateDiscriminator = stateDiscriminator;
//# sourceMappingURL=state.js.map