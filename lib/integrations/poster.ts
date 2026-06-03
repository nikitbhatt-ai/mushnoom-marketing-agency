// Multi-platform posting — wired in Phase 6 (only after Meta App Review clears).
// Open decision (Spec §14): Ayrshare vs Postproxy-type — pick by coverage + price.
// One call -> many platforms; the vendor handles OAuth + rate limits.
//
// Platform reality (§6): IG needs a public media URL at publish; limit is 100
// API-published posts / 24h per account (a carousel counts as 1).
//
// IMPORTANT: callers MUST pass canPublish(item) === true before calling this.
// TODO(Phase 6): publish an approved+scheduled item, then write to post_log.

export async function publish(_item: unknown): Promise<never> {
  throw new Error("poster.publish not implemented yet (Phase 6).");
}
