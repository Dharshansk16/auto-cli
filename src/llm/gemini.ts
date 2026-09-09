/**
 * 1. PURPOSE: Acts as the client wrapper for communicating with the Gemini API.
 * 2. ROLE IN THE FLOW: Instantiated by `cli.ts` and called by `run-turn.ts` to convert a user request into a tool call or clarification question.
 * 3. STEP-BY-STEP LOGIC:
 * - Expose `GeminiClient` class implementing `LLMClient`.
 * - Define `SYSTEM_PROMPT` containing constraints and behavioral instructions.
 * - Expose a `generate` method.
 * 4. INPUTS & OUTPUTS: Class instantiation takes API key. `generate` takes userInput, context, history, tools -> outputs `LLMResult`.
 * 5. EDGE CASES TO HANDLE: Handle missing tool calls from LLM (treat as clarification question). Handle API errors.
 * 6. SAMPLE CASE: `generate("status", ctx, [], tools)` -> returns `{ type: "tool_call", tool: "git_status", args: {} }`.
 */
import { GoogleGenAI } from "@google/genai";
import type {
  ConversationTurn,
  LLMClient,
  LLMResult,
  ProjectContext,
  ToolDefinition,
} from "../types.js";
import { contextToPromptText } from "../context/detector.js";

const SYSTEM_PROMPT = `You are an intelligent developer assistant. Your primary goal is to select and execute the correct tool based on the user's request. 
If the user's request is ambiguous, lacks required parameters, or cannot be safely executed with the available tools, you must ask a clear and concise clarification question.`;

/**
 * 1. PURPOSE: Converts our internal ToolDefinition format to the schema format expected by Gemini SDK.
 * 2. ROLE IN THE FLOW: Used internally by `GeminiClient.generate`.
 * 3. STEP-BY-STEP LOGIC:
 * 1. Map over the provided `tools` array.
 * 2. Extract `name`, `description`, and `parameters`.
 * 3. Reformat the type values to match what the Gemini API expects (e.g., uppercase).
 * 4. Return an array structure Gemini can ingest (`[{ functionDeclarations: [...] }]`).
 * 4. INPUTS & OUTPUTS: Input: `ToolDefinition[]`. Output: `any` (or correct GenAI type).
 * 5. EDGE CASES TO HANDLE: Ensure all deeply nested `type` properties in parameters are correctly formatted.
 * 6. SAMPLE CASE: Converts `{ type: "object" }` to `{ type: "OBJECT" }`.
 */
function toGeminiTools(tools: ToolDefinition[]): any {
  const formatSchema = (schema: any): any => {
    if (!schema) return schema;
    const newSchema = { ...schema };

    // Gemini SDK expects types to be uppercase strings like "OBJECT", "STRING"
    if (typeof newSchema.type === "string") {
      newSchema.type = newSchema.type.toUpperCase();
    }

    if (newSchema.properties) {
      const newProps: Record<string, any> = {};
      for (const [key, value] of Object.entries(newSchema.properties)) {
        newProps[key] = formatSchema(value);
      }
      newSchema.properties = newProps;
    }

    if (newSchema.items) {
      newSchema.items = formatSchema(newSchema.items);
    }

    return newSchema;
  };

  return [
    {
      functionDeclarations: tools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        parameters: formatSchema(tool.parameters),
      })),
    },
  ];
}

export class GeminiClient implements LLMClient {
  private ai: GoogleGenAI;

  /**
   * 1. PURPOSE: Initialize the Gemini SDK client.
   * 2. ROLE IN THE FLOW: Created at app startup in `cli.ts`.
   * 3. STEP-BY-STEP LOGIC:
   * 1. Instantiate `GoogleGenAI` using the passed `apiKey`.
   * 2. Assign to `this.ai`.
   * 4. INPUTS & OUTPUTS: Input: string (apiKey).
   * 5. EDGE CASES TO HANDLE: Invalid key (will fail later on request).
   * 6. SAMPLE CASE: `new GeminiClient("AIza...")`.
   */
  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  /**
   * 1. PURPOSE: Send a prompt to Gemini and return either a tool call or a clarification string.
   * 2. ROLE IN THE FLOW: Main heavy-lifting method called by `run-turn.ts`.
   * 3. STEP-BY-STEP LOGIC:
   * 1. Convert context and history to a readable text prompt format.
   * 2. Combine with the latest user input.
   * 3. Call the Gemini SDK (`generateContent`) using the formatted system instructions and tools.
   * 4. If the model returns `functionCalls`, parse the first one and return a ToolCallResult.
   * 5. Otherwise, parse the text response and return a ClarificationResult.
   * 4. INPUTS & OUTPUTS: Inputs: userInput, context, history, tools. Output: Promise<LLMResult>.
   * 5. EDGE CASES TO HANDLE: Empty response text, malformed function call.
   * 6. SAMPLE CASE: LLM decides to run "git status" -> returns `{ type: "tool_call", tool: "git_status", args: {} }`.
   */
  async generate(
    userInput: string,
    context: ProjectContext,
    history: ConversationTurn[],
    tools: ToolDefinition[],
  ): Promise<LLMResult> {
    // 1. Convert context and history to a readable text prompt format
    const contextText = contextToPromptText(context);
    const historyText =
      history.length > 0
        ? history
            .map(
              (turn: any) =>
                `${turn.role || "user"}: ${turn.content || turn.message || ""}`,
            )
            .join("\n")
        : "No previous history.";

    // 2. Combine with the latest user input
    const promptText = `
--- PROJECT CONTEXT ---
${contextText}

--- CONVERSATION HISTORY ---
${historyText}

--- CURRENT USER INPUT ---
${userInput}
    `.trim();

    // 3. Call the Gemini SDK (generateContent) using the formatted system instructions and tools
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: promptText,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          tools: tools.length > 0 ? toGeminiTools(tools) : undefined,
          temperature: 0,
        },
      });

      // 4. If the model returns functionCalls, parse the first one and return a ToolCallResult
      const functionCall = response.functionCalls?.[0];
      if (functionCall && functionCall.name) {
        return {
          type: "tool_call",
          tool: functionCall.name,
          args: functionCall.args as Record<string, any>,
        };
      }

      // 5. Otherwise, parse the text response and return a ClarificationResult
      return {
        type: "clarification",
        question:
          response.text ||
          "Could not generate a response. Please clarify your request.",
      };
    } catch (error: any) {
      // Edge Case: Handle API errors
      return {
        type: "clarification",
        question: `An error occurred while communicating with the AI: ${error.message}`,
      };
    }
  }
}
