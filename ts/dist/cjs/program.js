"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Program = void 0;
const pako_1 = require("pako");
const rpc_1 = require("./rpc");
const idl_1 = require("./idl");
const coder_1 = __importStar(require("./coder"));
const _1 = require("./");
const base64 = __importStar(require("base64-js"));
const assert = __importStar(require("assert"));
/**
 * Program is the IDL deserialized representation of a Solana program.
 */
class Program {
    constructor(idl, programId, provider) {
        this.idl = idl;
        this.programId = programId;
        this.provider = provider !== null && provider !== void 0 ? provider : _1.getProvider();
        // Build the serializer.
        const coder = new coder_1.default(idl);
        // Build the dynamic RPC functions.
        const [rpcs, ixs, txs, accounts, state] = rpc_1.RpcFactory.build(idl, coder, programId, this.provider);
        this.rpc = rpcs;
        this.instruction = ixs;
        this.transaction = txs;
        this.account = accounts;
        this.coder = coder;
        this.state = state;
    }
    /**
     * Generates a Program client by fetching the IDL from chain.
     */
    static async at(programId, provider) {
        const idl = await Program.fetchIdl(programId, provider);
        return new Program(idl, programId, provider);
    }
    /**
     * Fetches an idl from the blockchain.
     */
    static async fetchIdl(programId, provider) {
        provider = provider !== null && provider !== void 0 ? provider : _1.getProvider();
        const address = await idl_1.idlAddress(programId);
        const accountInfo = await provider.connection.getAccountInfo(address);
        // Chop off account discriminator.
        let idlAccount = idl_1.decodeIdlAccount(accountInfo.data.slice(8));
        const inflatedIdl = pako_1.inflate(idlAccount.data);
        return JSON.parse(decodeUtf8(inflatedIdl));
    }
    /**
     * Invokes the given callback everytime the given event is emitted.
     */
    addEventListener(eventName, callback) {
        // Values shared across log handlers.
        const thisProgramStr = this.programId.toString();
        const discriminator = coder_1.eventDiscriminator(eventName);
        const logStartIndex = "Program log: ".length;
        // Handles logs when the current program being executing is *not* this.
        const handleSystemLog = (log) => {
            // System component.
            const logStart = log.split(":")[0];
            // Recursive call.
            if (logStart.startsWith(`Program ${this.programId.toString()} invoke`)) {
                return [this.programId.toString(), false];
            }
            // Cpi call.
            else if (logStart.includes("invoke")) {
                return ["cpi", false]; // Any string will do.
            }
            else {
                // Did the program finish executing?
                if (logStart.match(/^Program (.*) consumed .*$/g) !== null) {
                    return [null, true];
                }
                return [null, false];
            }
        };
        // Handles logs from *this* program.
        const handleProgramLog = (log) => {
            // This is a `msg!` log.
            if (log.startsWith("Program log:")) {
                const logStr = log.slice(logStartIndex);
                const logArr = Buffer.from(base64.toByteArray(logStr));
                const disc = logArr.slice(0, 8);
                // Only deserialize if the discriminator implies a proper event.
                let event = null;
                if (disc.equals(discriminator)) {
                    event = this.coder.events.decode(eventName, logArr.slice(8));
                }
                return [event, null, false];
            }
            // System log.
            else {
                return [null, ...handleSystemLog(log)];
            }
        };
        // Main log handler. Returns a three element array of the event, the
        // next program that was invoked for CPI, and a boolean indicating if
        // a program has completed execution (and thus should be popped off the
        // execution stack).
        const handleLog = (execution, log) => {
            // Executing program is this program.
            if (execution.program() === thisProgramStr) {
                return handleProgramLog(log);
            }
            // Executing program is not this program.
            else {
                return [null, ...handleSystemLog(log)];
            }
        };
        // Each log given, represents an array of messages emitted by
        // a single transaction, which can execute many different programs across
        // CPI boundaries. However, the subscription is only interested in the
        // events emitted by *this* program. In achieving this, we keep track of the
        // program execution context by parsing each log and looking for a CPI
        // `invoke` call. If one exists, we know a new program is executing. So we
        // push the programId onto a stack and switch the program context. This
        // allows us to track, for a given log, which program was executing during
        // its emission, thereby allowing us to know if a given log event was
        // emitted by *this* program. If it was, then we parse the raw string and
        // emit the event if the string matches the event being subscribed to.
        //
        // @ts-ignore
        return this.provider.connection.onLogs(this.programId, (logs, ctx) => {
            if (logs.err) {
                console.error(logs);
                return;
            }
            const logScanner = new LogScanner(logs.logs);
            const execution = new ExecutionContext(logScanner.next());
            let log = logScanner.next();
            while (log !== null) {
                let [event, newProgram, didPop] = handleLog(execution, log);
                if (event) {
                    callback(event, ctx.slot);
                }
                if (newProgram) {
                    execution.push(newProgram);
                }
                if (didPop) {
                    execution.pop();
                }
                log = logScanner.next();
            }
        });
    }
    async removeEventListener(listener) {
        // @ts-ignore
        return this.provider.connection.removeOnLogsListener(listener);
    }
}
exports.Program = Program;
// Stack frame execution context, allowing one to track what program is
// executing for a given log.
class ExecutionContext {
    constructor(log) {
        // Assumes the first log in every transaction is an `invoke` log from the
        // runtime.
        const program = /^Program (.*) invoke.*$/g.exec(log)[1];
        this.stack = [program];
    }
    program() {
        assert.ok(this.stack.length > 0);
        return this.stack[this.stack.length - 1];
    }
    push(newProgram) {
        this.stack.push(newProgram);
    }
    pop() {
        assert.ok(this.stack.length > 0);
        this.stack.pop();
    }
}
class LogScanner {
    constructor(logs) {
        this.logs = logs;
    }
    next() {
        if (this.logs.length === 0) {
            return null;
        }
        let l = this.logs[0];
        this.logs = this.logs.slice(1);
        return l;
    }
}
function decodeUtf8(array) {
    const decoder = typeof TextDecoder === "undefined"
        ? new (require("util").TextDecoder)("utf-8") // Node.
        : new TextDecoder("utf-8"); // Browser.
    return decoder.decode(array);
}
//# sourceMappingURL=program.js.map