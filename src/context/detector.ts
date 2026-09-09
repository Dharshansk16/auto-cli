/**
 * 1. PURPOSE: Collects runtime environment context (OS, git, npm, docker) for the LLM.
 * 2. ROLE IN THE FLOW: Called at startup in `cli.ts` to build the `ProjectContext` object.
 * 3. STEP-BY-STEP LOGIC:
 *    - Define isolated helper functions to detect OS platform, git status, package.json scripts, docker presence, and running containers.
 *    - Aggregate all these into a `ProjectContext` object in `buildContext`.
 *    - Define a `contextToPromptText` formatter.
 * 4. INPUTS & OUTPUTS: Exports `buildContext` -> `Promise<ProjectContext>`.
 * 5. EDGE CASES TO HANDLE: Missing directories, commands failing (e.g. docker daemon down).
 * 6. SAMPLE CASE: `buildContext()` -> returns object with `platform: "darwin"`, `hasDocker: false`, etc.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { execa } from "execa";
import type { ProjectContext } from "../types.js";
import { loadConfig } from "../config/loader.js";

/**
 * 1. PURPOSE: Returns the current OS platform.
 * 2. ROLE IN THE FLOW: Context helper.
 * 3. STEP-BY-STEP LOGIC: Return 'darwin', 'linux', or 'other' based on `process.platform`.
 * 4. INPUTS & OUTPUTS: Returns platform string literal.
 * 5. EDGE CASES TO HANDLE: N/A.
 * 6. SAMPLE CASE: Mac OS -> "darwin".
 */
function detectPlatform(): ProjectContext["platform"] {
  if (process.platform === "darwin") return "darwin";
  if (process.platform === "linux") return "linux";
  return "other";
}

/**
 * 1. PURPOSE: Determines if the cwd is a git repo and fetches branch/status.
 * 2. ROLE IN THE FLOW: Context helper.
 * 3. STEP-BY-STEP LOGIC:
 *    1. Check if `.git` folder exists. If not, return `{ isGitRepo: false }`.
 *    2. Run `git branch --show-current` and `git status --short`.
 *    3. Parse output and return status summary.
 * 4. INPUTS & OUTPUTS: Input: cwd string. Output: object with `isGitRepo`, `gitBranch`, `gitStatusSummary`.
 * 5. EDGE CASES TO HANDLE: Git commands fail despite `.git` existing.
 * 6. SAMPLE CASE: In clean repo on main -> `{ isGitRepo: true, gitBranch: "main", gitStatusSummary: "clean" }`.
 */
async function detectGit(cwd: string): Promise<Pick<ProjectContext, "isGitRepo" | "gitBranch" | "gitStatusSummary">> {
  if (!existsSync(join(cwd, ".git"))) {
    return { isGitRepo: false };
  }

  try {
    const branchRes = await execa("git", ["branch", "--show-current"], { cwd });
    const statusRes = await execa("git", ["status", "--short"], { cwd });
    
    return {
      isGitRepo: true,
      gitBranch: branchRes.stdout.trim() || undefined,
      gitStatusSummary: statusRes.stdout.trim() || "clean",
    };
  } catch (e) {
    return { isGitRepo: true, gitStatusSummary: "error reading git status" };
  }
}

/**
 * 1. PURPOSE: Parses package.json to get available scripts.
 * 2. ROLE IN THE FLOW: Context helper.
 * 3. STEP-BY-STEP LOGIC:
 *    1. Read `package.json` if it exists.
 *    2. Parse JSON.
 *    3. Return `scripts` object or undefined.
 * 4. INPUTS & OUTPUTS: Input: cwd string. Output: Record of scripts.
 * 5. EDGE CASES TO HANDLE: Missing file, invalid JSON.
 * 6. SAMPLE CASE: valid package.json -> returns `{ dev: "...", build: "..." }`.
 */
function detectPackageJsonScripts(cwd: string): Record<string, string> | undefined {
  const pkgPath = join(cwd, "package.json");
  if (!existsSync(pkgPath)) return undefined;

  try {
    const content = readFileSync(pkgPath, "utf-8");
    const parsed = JSON.parse(content);
    if (parsed.scripts && typeof parsed.scripts === "object") {
      return parsed.scripts;
    }
  } catch {
    // Ignore invalid JSON
  }
  return undefined;
}

/**
 * 1. PURPOSE: Checks if project has docker configured.
 * 2. ROLE IN THE FLOW: Context helper.
 * 3. STEP-BY-STEP LOGIC: Check for existence of Dockerfile, docker-compose.yml, or docker-compose.yaml.
 * 4. INPUTS & OUTPUTS: Input: cwd string. Output: boolean.
 * 5. EDGE CASES TO HANDLE: File case sensitivity.
 * 6. SAMPLE CASE: Folder has `Dockerfile` -> returns true.
 */
function detectDocker(cwd: string): boolean {
  return (
    existsSync(join(cwd, "Dockerfile")) ||
    existsSync(join(cwd, "docker-compose.yml")) ||
    existsSync(join(cwd, "docker-compose.yaml"))
  );
}

/**
 * 1. PURPOSE: Lists names of running docker containers.
 * 2. ROLE IN THE FLOW: Context helper.
 * 3. STEP-BY-STEP LOGIC:
 *    1. Run `docker ps --format "{{.Names}}"`.
 *    2. Split output by newline, filter empty.
 *    3. Return array of names or undefined.
 * 4. INPUTS & OUTPUTS: Input: none. Output: array of strings or undefined.
 * 5. EDGE CASES TO HANDLE: Docker daemon down -> swallow error and return undefined.
 * 6. SAMPLE CASE: One container running -> returns ["db_1"].
 */
async function listRunningContainers(): Promise<string[] | undefined> {
  try {
    const res = await execa("docker", ["ps", "--format", "{{.Names}}"]);
    const containers = res.stdout.split("\n").map(n => n.trim()).filter(Boolean);
    return containers.length > 0 ? containers : undefined;
  } catch {
    return undefined;
  }
}

/**
 * 1. PURPOSE: Aggregates all environment checks into a single ProjectContext object.
 * 2. ROLE IN THE FLOW: Main entry point for context detection, called by `cli.ts`.
 * 3. STEP-BY-STEP LOGIC:
 *    1. Call platform, git, package.json, docker detection helpers.
 *    2. If docker is found, also fetch running containers.
 *    3. Load `.autocli.yaml` aliases using `loadConfig`.
 *    4. Return combined object.
 * 4. INPUTS & OUTPUTS: Input: cwd string (defaults to process.cwd()). Output: ProjectContext.
 * 5. EDGE CASES TO HANDLE: Awaiting async calls successfully.
 * 6. SAMPLE CASE: Assembles all partial objects into one master `ProjectContext`.
 */
export async function buildContext(cwd: string = process.cwd()): Promise<ProjectContext> {
  const platform = detectPlatform();
  const gitContext = await detectGit(cwd);
  const packageJsonScripts = detectPackageJsonScripts(cwd);
  const hasDocker = detectDocker(cwd);
  let runningContainers: string[] | undefined = undefined;
  
  if (hasDocker) {
    runningContainers = await listRunningContainers();
  }

  const agentConfig = loadConfig(cwd);
  const customAliases = agentConfig?.aliases;

  return {
    cwd,
    platform,
    ...gitContext,
    packageJsonScripts,
    hasDocker,
    runningContainers,
    customAliases,
  };
}

/**
 * 1. PURPOSE: Formats the raw ProjectContext object into a readable block for the LLM prompt.
 * 2. ROLE IN THE FLOW: Called inside `GeminiClient.generate`.
 * 3. STEP-BY-STEP LOGIC:
 *    1. Map keys to descriptive string lines (e.g., "Working directory: ...").
 *    2. Join lines with newline separator.
 * 4. INPUTS & OUTPUTS: Input: ProjectContext. Output: multi-line string.
 * 5. EDGE CASES TO HANDLE: Null/undefined fields gracefully omit their line.
 * 6. SAMPLE CASE: Input context with isGitRepo = true -> Output includes "Git repo: yes".
 */
export function contextToPromptText(ctx: ProjectContext): string {
  const lines: string[] = [];
  
  lines.push(`Working directory: ${ctx.cwd}`);
  lines.push(`Platform: ${ctx.platform}`);
  
  if (ctx.isGitRepo) {
    lines.push(`Git repo: yes`);
    if (ctx.gitBranch) lines.push(`Git branch: ${ctx.gitBranch}`);
    if (ctx.gitStatusSummary) lines.push(`Git status summary:\n${ctx.gitStatusSummary}`);
  } else {
    lines.push(`Git repo: no`);
  }
  
  if (ctx.packageJsonScripts && Object.keys(ctx.packageJsonScripts).length > 0) {
    lines.push(`NPM Scripts available: ${Object.keys(ctx.packageJsonScripts).join(", ")}`);
  }
  
  if (ctx.hasDocker) {
    lines.push(`Docker detected: yes`);
    if (ctx.runningContainers && ctx.runningContainers.length > 0) {
      lines.push(`Running Docker containers: ${ctx.runningContainers.join(", ")}`);
    } else {
      lines.push(`Running Docker containers: none`);
    }
  }
  
  if (ctx.customAliases) {
    const aliasStr = Object.entries(ctx.customAliases).map(([k, v]) => `${k} -> ${v}`).join(", ");
    lines.push(`Custom aliases: ${aliasStr}`);
  }
  
  return lines.join("\n");
}

