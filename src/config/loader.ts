/**
 * 1. PURPOSE: Loads user-defined project configuration (like custom command aliases) from `.aiagent.yaml`.
 * 2. ROLE IN THE FLOW: Called by `detector.ts` when building the context for the LLM.
 * 3. STEP-BY-STEP LOGIC:
 *    - Define `AgentConfig` interface.
 *    - Implement `loadConfig` function to safely parse the YAML.
 * 4. INPUTS & OUTPUTS: Exports interface and `loadConfig` function.
 * 5. EDGE CASES TO HANDLE: Missing file, invalid YAML syntax.
 * 6. SAMPLE CASE: File exists with `aliases: { dev: "npm start" }` -> Returns `{ aliases: { dev: "npm start" } }`.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";

export interface AgentConfig {
  aliases?: Record<string, string>;
}

/**
 * 1. PURPOSE: Parses `.aiagent.yaml` if it exists.
 * 2. ROLE IN THE FLOW: Helper inside detector.
 * 3. STEP-BY-STEP LOGIC:
 *    1. Check for `.aiagent.yaml` in the given `cwd`.
 *    2. If it does not exist, return undefined.
 *    3. Read the file contents.
 *    4. Parse using YAML parser.
 *    5. Return the result cast to `AgentConfig`.
 * 4. INPUTS & OUTPUTS: Input: cwd string. Output: AgentConfig | undefined.
 * 5. EDGE CASES TO HANDLE: Catch parsing exceptions and return undefined.
 * 6. SAMPLE CASE: Missing file -> Returns undefined.
 */
export function loadConfig(cwd: string): AgentConfig | undefined {
  // TODO: Implement YAML parsing logic
  const configPath=join(cwd, ".aiagent.yaml");
  if(!existsSync(configPath)){
    return undefined;
  }

  try{
    const contents=readFileSync(configPath,"utf-8");
    const parsed=parse(contents) as AgentConfig;
    return parsed;
  }
  catch{
    return undefined;
  }
}


//temporary test code- delete later
console.log(loadConfig(process.cwd()));   // should return the config object
console.log(loadConfig("/tmp"));          // should return undefined (no .aiagent.yaml there)