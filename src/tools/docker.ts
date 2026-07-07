/**
 * 1. PURPOSE: Defines docker-related commands as tools for the LLM.
 * 2. ROLE IN THE FLOW: Imported by src/tools/registry.ts to be aggregated into the global toolset.
 * 3. STEP-BY-STEP LOGIC:
 *    - Export `dockerTools` array containing ToolDefinitions.
 *    - Include definitions for `docker_list_containers`, `docker_logs`, `docker_compose_up`, `docker_compose_down`, `docker_restart_container`.
 * 4. INPUTS & OUTPUTS: Exports `dockerTools` array of ToolDefinition objects.
 * 5. EDGE CASES TO HANDLE: N/A for array definition itself.
 * 6. SAMPLE CASE: Array contains object with name "docker_logs".
 */
import type { ToolDefinition } from "../types.js";

/**
 * 1. PURPOSE: Sanitizes and validates docker container/service names.
 * 2. ROLE IN THE FLOW: Used inside docker tool resolve functions to prevent shell injection.
 * 3. STEP-BY-STEP LOGIC:
 *    1. Convert value to string.
 *    2. Check if string matches a safe regex pattern (e.g., alphanumeric, underscores, hyphens).
 *    3. If invalid, throw an Error.
 *    4. Return the safe string.
 * 4. INPUTS & OUTPUTS: Input: unknown. Output: string.
 * 5. EDGE CASES TO HANDLE: Null/undefined inputs -> throw error. Malicious strings like `foo; rm -rf /` -> throw error.
 * 6. SAMPLE CASE: Input "my-container" -> Output "my-container". Input "foo;ls" -> Throws Error.
 */
function safeName(value: unknown): string {
  if (value === null || value === undefined) {
    throw new Error("Container/service name cannot be null or undefined.");
  }

  const name = String(value);

  if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
    throw new Error(
      `Invalid container/service name: "${name}". Only alphanumeric characters, hyphens, and underscores are allowed.`
    );
  }
  return name;
}

export const dockerTools: ToolDefinition[] = [
  {
    name: "docker_list_containers",
    description: "Lists all running Docker containers.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
    safety: "auto",
    resolve: () => "docker ps",
  },

  {
    name: "docker_logs",
    description: "Fetches the logs of a specific running Docker container.",
    parameters: {
      type: "object",
      properties: {
        container_name: {
          type: "string",
          description: "The name or ID of the container to fetch logs from.",
        },
      },
      required: ["container_name"],
    },
    safety: "auto",
    resolve: (args) => `docker logs ${safeName(args.container_name)}`,
  },

  {
    name: "docker_compose_up",
    description: "Starts all services defined in docker-compose.yml in detached mode.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
    safety: "confirm",
    resolve: () => "docker compose up -d",
  },

  {
    name: "docker_compose_down",
    description: "Stops and removes all containers defined in docker-compose.yml.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
    safety: "confirm",
    resolve: () => "docker compose down",
  },

  {
    name: "docker_restart_container",
    description: "Restarts a specific Docker container by name.",
    parameters: {
      type: "object",
      properties: {
        container_name: {
          type: "string",
          description: "The name of the container to restart.",
        },
      },
      required: ["container_name"],
    },
    safety: "confirm",
    resolve: (args) => `docker restart ${safeName(args.container_name)}`,
  },
];

// temporary test — delete after
console.log(dockerTools.map(t => t.name));
// expected: [ 'docker_list_containers', 'docker_logs', 'docker_compose_up', 'docker_compose_down', 'docker_restart_container' ]

console.log(dockerTools[1].resolve({ container_name: "my-app" }, {} as any));
// expected: docker logs my-app

try {
  dockerTools[1].resolve({ container_name: "foo; rm -rf /" }, {} as any);
} catch (e) {
  console.log("safeName blocked injection ✅");
}