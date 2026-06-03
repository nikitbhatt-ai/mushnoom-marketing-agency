// Shared agent runner — wired in Phase 3 (generation).
//
// Pattern (Spec §4, §13): every agent is a config object + the same runAgent().
// runAgent(config, input) -> structured JSON. It also logs tokens + cost to
// usage_log on every call and enforces the per-client monthly quota (hard rule 4).
//
// WHY one runner: the only thing that differs between Amplifier / Analyst /
// Strategist is the config (model + system prompt + output schema). Keeping the
// plumbing in one place means quota + usage logging can never be forgotten.

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

// TODO(Phase 3): implement against @anthropic-ai/sdk.
//   1. Check per-client quota (PER_CLIENT_MONTHLY_QUOTA) before the call.
//   2. Call Claude with config.model + config.systemPrompt + input.
//   3. Parse the structured JSON against config.outputSchema.
//   4. Insert a usage_log row (client_id, agent, model, tokens, cost).
export async function runAgent<T>(
  _config: AgentConfig,
  _input: string,
  _clientId: string
): Promise<RunAgentResult<T>> {
  throw new Error(
    "runAgent is not implemented yet (Phase 3). Phase 1 is mock-data only."
  );
}
