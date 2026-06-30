// test-history.ts (deleting after testing)
import { logExecution, readHistory } from "./src/logger/history.js";

logExecution({
  timestamp: new Date().toISOString(),
  tool: "git_status",
  args: {},
  command: "git status",
  exitCode: 0,
  success: true,
});

console.log(readHistory(2));