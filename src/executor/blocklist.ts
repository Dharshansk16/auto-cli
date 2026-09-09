/**
 * 1. PURPOSE: Hard-coded security blocklist to prevent catastrophic shell commands.
 * 2. ROLE IN THE FLOW: Called by `run-turn.ts` right before execution/confirmation.
 * 3. STEP-BY-STEP LOGIC:
 *    - Define an array of regex patterns targeting destructive commands.
 *    - Iterate over them to see if the command matches any.
 * 4. INPUTS & OUTPUTS: Exports a check function.
 * 5. EDGE CASES TO HANDLE: Pattern variations (e.g. `rm -rf /` vs `rm -fr /`).
 * 6. SAMPLE CASE: Command is `sudo rm -rf /` -> returns `{ blocked: true, reason: ... }`.
 */

export interface BlockCheckResult {
  blocked: boolean;
  reason?: string;
}

/**
 * 1. PURPOSE: Checks a fully resolved command string against forbidden regex patterns.
 * 2. ROLE IN THE FLOW: Last line of defense.
 * 3. STEP-BY-STEP LOGIC:
 *    1. Define patterns for: recursive delete root, fork bombs, sudo, raw disk writes, force-pushing.
 *    2. Iterate through patterns.
 *    3. If `pattern.test(command)` is true, return immediately with `blocked: true` and the reason.
 *    4. If no matches, return `blocked: false`.
 * 4. INPUTS & OUTPUTS: Input: command string. Output: BlockCheckResult.
 * 5. EDGE CASES TO HANDLE: N/A.
 * 6. SAMPLE CASE: "git status" -> `{ blocked: false }`.
 */
export function checkBlocklist(command: string): BlockCheckResult {
  const patterns: { regex: RegExp; reason: string }[]=[
    {
      // matches rm -rf /, rm -fr /, rm -rf /*, rm --recursive --force / etc
      regex: /rm\s+(-\w*[rf]\w*\s+){1,2}\/[\s*]*/,
      reason: "Recursive deletion of root filesystem is not allowed.",
    },
    {
      // fork bomb: :(){:|:&};:
      regex: /:\s*\(\s*\)\s*\{/,
      reason: "Fork bomb pattern detected.",
    },
    {
      // any sudo usage
      regex: /\bsudo\b/,
      reason: "sudo commands are not permitted through this agent.",
    },
    {
      // raw disk writes: dd if=... of=/dev/...
      regex: /\bdd\b.*of=\/dev\//,
      reason: "Raw disk write operations are not allowed.",
    },
    {
      // mkfs — disk formatting
      regex: /\bmkfs\b/,
      reason: "Disk formatting commands are not allowed.",
    },
    {
       // git push --force or git push -f
      regex: /git\s+push\s+.*(-f|--force)/,
      reason: "Force-pushing to git remotes is blocked.",
    },
  ];

  for(const {regex,reason} of patterns ){
    if(regex.test(command)){
      return {
        blocked: true,
        reason
      }
    }
  }

  return {
    blocked:false
  };
}


