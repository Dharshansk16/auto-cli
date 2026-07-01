Day 1 — : Execution & Security Layer

Goal: Build standalone utility files.

Completed

✅ src/logger/history.ts
Created ~/.aiagent automatically if missing.
Implemented logExecution() using JSONL (history.jsonl).
Implemented readHistory(limit) to return the last N entries.
Gracefully handles missing history file and malformed JSON lines.

---------------------------------------------------------------------------------------

Day 2 — : Core Security & Execution

Goal: Implement the security blocklist and command runner.

Completed

✅ src/executor/blocklist.ts
Added regex-based checks for dangerous commands:
rm -rf /
fork bombs
sudo
dd
mkfs
git push --force
Returns early with a block reason when a match is found.
Used regex word boundaries (\b) and handled flag variations (-rf, -fr).
✅ src/executor/runner.ts
Implemented runCommand() using execa.
Configured shell: true, cwd, and stdio: "inherit" for live terminal output.
Returns { exitCode, success } for both success and failure cases.
Handles command failures and OS-level execution errors separately.