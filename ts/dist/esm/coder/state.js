import { sha256 } from "js-sha256";
import { IdlCoder } from "./idl";
export class StateCoder {
    constructor(idl) {
        if (idl.state === undefined) {
            throw new Error("Idl state not defined.");
        }
        this.layout = IdlCoder.typeDefLayout(idl.state.struct, idl.types);
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
// Calculates unique 8 byte discriminator prepended to all anchor state accounts.
export async function stateDiscriminator(name) {
    return Buffer.from(sha256.digest(`state:${name}`)).slice(0, 8);
}
//# sourceMappingURL=state.js.map