// Reel clipping — wired in Phase 6.
// Open decision (Spec §14): OpusClip vs Reap vs Bytecap — pick by API + price.
// They do clip detection, captions, and 9:16 reframe so we don't build a video editor.
//
// TODO(Phase 6): take a source video URL, return clip URLs + caption text
// (the spoken words feed the claims check).

export async function makeReelClips(_videoUrl: string): Promise<never> {
  throw new Error("clipper.makeReelClips not implemented yet (Phase 6).");
}
