import type { ContentItem } from "./types";

/**
 * THE hard guard (Master Build Spec §7).
 * Call this before EVERY transition to `scheduled` or `posted`.
 *
 * canPublish(item) === true  iff
 *   - a human has confirmed the claims check (claimsChecked), AND
 *   - a human has approved it (approvedBy is set).
 *
 * WHY a function and not a convention: human gates are code, not etiquette
 * (§2.4). Generation is automated; publishing is not. This is the one line
 * that keeps a draft from ever reaching a platform without a person signing off.
 */
export function canPublish(item: Pick<ContentItem, "claimsChecked" | "approvedBy">): boolean {
  return item.claimsChecked === true && item.approvedBy != null;
}

/**
 * Human-readable reason a thing can't publish yet — for UI tooltips / disabled
 * states. Returns null when it CAN publish.
 */
export function blockedReason(
  item: Pick<ContentItem, "claimsChecked" | "approvedBy">
): string | null {
  if (!item.claimsChecked && item.approvedBy == null) {
    return "Needs a claims check and human approval before it can be scheduled.";
  }
  if (!item.claimsChecked) return "Claims check not confirmed yet.";
  if (item.approvedBy == null) return "Not approved by a human yet.";
  return null;
}
