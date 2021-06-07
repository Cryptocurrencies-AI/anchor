import * as assert from "assert";
const LOG_START_INDEX = "Program log: ".length;
export class EventParser {
    constructor(coder, programId) {
        this.coder = coder;
        this.programId = programId;
    }
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
    parseLogs(logs, callback) {
        const logScanner = new LogScanner(logs);
        const execution = new ExecutionContext(logScanner.next());
        let log = logScanner.next();
        while (log !== null) {
            let [event, newProgram, didPop] = this.handleLog(execution, log);
            if (event) {
                callback(event);
            }
            if (newProgram) {
                execution.push(newProgram);
            }
            if (didPop) {
                execution.pop();
                // Skip the "success" log, which always follows the consumed log.
                logScanner.next();
            }
            log = logScanner.next();
        }
    }
    // Main log handler. Returns a three element array of the event, the
    // next program that was invoked for CPI, and a boolean indicating if
    // a program has completed execution (and thus should be popped off the
    // execution stack).
    handleLog(execution, log) {
        // Executing program is this program.
        if (execution.program() === this.programId.toString()) {
            return this.handleProgramLog(log);
        }
        // Executing program is not this program.
        else {
            return [null, ...this.handleSystemLog(log)];
        }
    }
    // Handles logs from *this* program.
    handleProgramLog(log) {
        // This is a `msg!` log.
        if (log.startsWith("Program log:")) {
            const logStr = log.slice(LOG_START_INDEX);
            const event = this.coder.events.decode(logStr);
            return [event, null, false];
        }
        // System log.
        else {
            return [null, ...this.handleSystemLog(log)];
        }
    }
    // Handles logs when the current program being executing is *not* this.
    handleSystemLog(log) {
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
    }
}
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
//# sourceMappingURL=event.js.map