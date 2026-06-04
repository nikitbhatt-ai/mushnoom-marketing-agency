// Shared agent runner (Phase 3).
//
// Pattern (Spec §4, §13): every agent is a config object + the same runAgent().
// runAgent(config, input) -> structured JSON. It also logs tokens + cost to
// usage_log on every call and enforces the per-client monthly quota (hard rule 4).
//
// WHY one runner: the only thing that differs between Amplifier / Analyst /
// Strategist is the config (model + system prompt + output schema). Keeping the
// plumbing in one place means quota + usage logging can never be forgotten.

import type Anthropic from "@anthropic-ai/sdk";
import { getServiceClient } from "@/lib/db/supabase";
import {
  assertWithinQuota,
  estimateCost,
  getAnthropic,
  logUsage,
} from "./anthropic";

export interface AgentConfig {
  name: "amplifier" | "analyst" | "strategist";
  model: string; // e.g. "claude-haiku-4-5" | "claude-sonnet-4-6" | "claude-opus-4-8"
  systemPrompt: string; // the skill lives here; fix output by fixing this
  /** JSON schema describing the structured output we expect back. */
  outputSchema: Record<string, unknown>;
  maxTokens?: number;
}

export interface RunAgentResult<T> {
  data: T;
  usage: { tokensIn: number; tokensOut: number; cost: number };
}

/**
 * Run one agent over `input` and return schema-shaped JSON.
 *
 * How we force structure: instead of hoping the model returns clean JSON, we
 * expose a single tool whose input_schema IS the agent's outputSchema and force
 * the model to call it. The tool's arguments are then guaranteed to match shape.
 *
 * Requires both Supabase (to log usage / check quota) and an Anthropic key. The
 * caller is expected to have checked configuration and fall back to the
 * simulated path otherwise — here we fail loudly rather than silently skip the
 * usage log (hard rule 4).
 */
export async function runAgent<T>(
  config: AgentConfig,
  input: string,
  clientId: string
): Promise<RunAgentResult<T>> {
  const anthropic = getAnthropic();
  const db = getServiceClient();
  if (!anthropic) throw new Error("ANTHROPIC_API_KEY is not set.");
  if (!db) throw new Error("Supabase is not configured; cannot log usage.");

  // Hard rule 4: never start a call that would blow the monthly quota.
  await assertWithinQuota(db, clientId);

  const message = await anthropic.messages.create({
    model: config.model,
    max_tokens: config.maxTokens ?? 2048,
    system: config.systemPrompt,
    tools: [
      {
        name: "emit",
        description:
          "Return the finished content as structured JSON matching the schema.",
        input_schema: config.outputSchema as Anthropic.Tool.InputSchema,
      },
    ],
    tool_choice: { type: "tool", name: "emit" },
    messages: [{ role: "user", content: input }],
  });

  const tokensIn = message.usage.input_tokens;
  const tokensOut = message.usage.output_tokens;
  const cost = estimateCost(config.model, tokensIn, tokensOut);
  await logUsage(db, clientId, config.name, config.model, {
    tokensIn,
    tokensOut,
    cost,
  });

  const toolUse = message.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error(`${config.name} did not return structured output.`);
  }

  return {
    data: toolUse.input as T,
    usage: { tokensIn, tokensOut, cost },
  };
}
