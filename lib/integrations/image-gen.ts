// Image generation & editing — orchestrated AI imagery (roadmap; wired in a later phase).
//
// Tool: Nano Banana (Google's Gemini image model). Two distinct jobs:
//   1. GENERATE net-new on-brand imagery from a prompt (e.g. a lifestyle scene
//      behind a static, a backdrop a Canva template autofills over).
//   2. EDIT existing assets — clean up / restyle a product photo, place it in a scene.
//
// Orchestrate, don't build (hard rule 5): we call a hosted image model, we don't
// train or run one. Output lands in a PUBLIC Supabase Storage bucket like Canva
// renders, so media is at a public URL by publish time (§6).
//
// Like every model call, an image call MUST log tokens/cost to usage_log and
// respect the per-client quota (hard rule 4) — route it through the same usage
// path as runAgent/extract, never a side channel.
//
// CLAIMS APPLY TO IMAGES TOO: a generated image that implies a health outcome is
// still a disease claim. Generated/edited imagery has to pass the same structure/
// function review as copy before a content_item can publish (hard rules 1 & 2).
//
// TODO(Phase 3+): generateImage(prompt) and editImage(srcUrl, prompt) -> Storage URL.

export async function generateImage(_prompt: string): Promise<never> {
  throw new Error("image-gen.generateImage not implemented yet.");
}

export async function editImage(
  _srcUrl: string,
  _prompt: string
): Promise<never> {
  throw new Error("image-gen.editImage not implemented yet.");
}
