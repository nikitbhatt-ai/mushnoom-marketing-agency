// Canva render — wired in Phase 3.
// Render carousels/statics from on-brand Canva templates; output goes to a
// PUBLIC Supabase Storage bucket (media must be at a public URL at publish time, §6).
// Orchestrate, don't build (hard rule 5): no image engine of our own.
//
// A Canva MCP connection already exists (brand templates, export, etc.).
// TODO(Phase 3): fill a brand template with generated copy, export PNG, upload to Storage.

export async function renderCarousel(_copy: unknown): Promise<never> {
  throw new Error("canva.renderCarousel not implemented yet (Phase 3).");
}

export async function renderStatic(_copy: unknown): Promise<never> {
  throw new Error("canva.renderStatic not implemented yet (Phase 3).");
}
