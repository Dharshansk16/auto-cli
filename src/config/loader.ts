/**
 * 1. PURPOSE: Loads user-defined project configuration (like custom command aliases) from `.autocli.yaml`.
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
 * 1. PURPOSE: Parses `.autocli.yaml` if it exists.
 * 2. ROLE IN THE FLOW: Helper inside detector.
 * 3. STEP-BY-STEP LOGIC:
 *    1. Check for `.autocli.yaml` in the given `cwd`.
 *    2. If it does not exist, return undefined.
 *    3. Read the file contents.
 *    4. Parse using YAML parser.
 *    5. Return the result cast to `AgentConfig`.
 * 4. INPUTS & OUTPUTS: Input: cwd string. Output: AgentConfig | undefined.
 * 5. EDGE CASES TO HANDLE: Catch parsing exceptions and return undefined.
 * 6. SAMPLE CASE: Missing file -> Returns undefined.
 */
export function loadConfig(cwd: string): AgentConfig | undefined {
  const configPath=join(cwd, ".autocli.yaml");
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


