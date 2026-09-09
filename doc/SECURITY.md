# Security Policy

The AI Terminal Agent runs arbitrary shell commands on your local machine. Security and user consent are the highest priorities of this project.

## Safety Tiers

Every tool defined in the system has a strict safety tier:
- **`auto`**: The command runs immediately without user confirmation. This is strictly reserved for read-only actions (e.g., `git status`, `docker ps`).
- **`confirm`**: The command requires explicit `Y/N` confirmation from the user before execution. Any action that mutates state, creates files, or talks to external networks falls into this tier.

## The Blocklist

Regardless of the tool or safety tier, every resolved shell command is passed through a hard-coded security blocklist (`src/executor/blocklist.ts`) prior to execution. 

The agent will proactively block and refuse to execute:
- Recursive deletions of root (`rm -rf /`)
- Fork bombs (`:(){ :|:& };:`)
- Any `sudo` execution
- Raw disk writes (`dd of=/dev/...`, `mkfs`)
- Force-pushes to remote git repositories (`git push --force`)

If you find a new destructive pattern, please open a PR to add it to the blocklist.
