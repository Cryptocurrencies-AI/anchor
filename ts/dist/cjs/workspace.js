"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const camelcase_1 = __importDefault(require("camelcase"));
const web3_js_1 = require("@solana/web3.js");
const program_1 = require("./program");
let _populatedWorkspace = false;
/**
 * The `workspace` namespace provides a convenience API to automatically
 * search for and deserialize [[Program]] objects defined by compiled IDLs
 * in an Anchor workspace.
 *
 * This API is for Node only.
 */
const workspace = new Proxy({}, {
    get(workspaceCache, programName) {
        // const find = require("find");
        // const fs = require("fs");
        // const process = require("process");
        // if (typeof window !== "undefined") {
        //   // Workspaces aren't available in the browser, yet.
        //   return undefined;
        // }
        // if (!_populatedWorkspace) {
        //   const path = require("path");
        //   let projectRoot = process.cwd();
        //   while (!fs.existsSync(path.join(projectRoot, "Anchor.toml"))) {
        //     const parentDir = path.dirname(projectRoot);
        //     if (parentDir === projectRoot) {
        //       projectRoot = undefined;
        //     }
        //     projectRoot = parentDir;
        //   }
        //   if (projectRoot === undefined) {
        //     throw new Error("Could not find workspace root.");
        //   }
        //   const idlMap = new Map<string, Idl>();
        //   find
        //     .fileSync(/target\/idl\/.*\.json/, projectRoot)
        //     .reduce((programs: any, path: string) => {
        //       const idlStr = fs.readFileSync(path);
        //       const idl = JSON.parse(idlStr);
        //       idlMap.set(idl.name, idl);
        //       const name = camelCase(idl.name, { pascalCase: true });
        //       if (idl.metadata && idl.metadata.address) {
        //         programs[name] = new Program(
        //           idl,
        //           new PublicKey(idl.metadata.address)
        //         );
        //       }
        //       return programs;
        //     }, workspaceCache);
        //   // Override the workspace programs if the user put them in the config.
        //   const anchorToml = toml.parse(
        //     fs.readFileSync(path.join(projectRoot, "Anchor.toml"), "utf-8")
        //   );
        //   const clusterId = anchorToml.provider.cluster;
        //   if (anchorToml.clusters && anchorToml.clusters[clusterId]) {
        //     attachWorkspaceOverride(
        //       workspaceCache,
        //       anchorToml.clusters[clusterId],
        //       idlMap
        //     );
        //   }
        //   _populatedWorkspace = true;
        // }
        // return workspaceCache[programName];
    },
});
function attachWorkspaceOverride(workspaceCache, overrideConfig, idlMap) {
    Object.keys(overrideConfig).forEach((programName) => {
        const wsProgramName = camelcase_1.default(programName, { pascalCase: true });
        const overrideAddress = new web3_js_1.PublicKey(overrideConfig[programName]);
        workspaceCache[wsProgramName] = new program_1.Program(idlMap.get(programName), overrideAddress);
    });
}
exports.default = workspace;
//# sourceMappingURL=workspace.js.map