// Transcription / ASR — wired in Phase 4.
// Open decision (Spec §14): hosted Whisper vs an API — pick by cost per minute.
// Gives Claude the video's spoken content as text (needed for claims checks on reels).
//
// TODO(Phase 4): take a media URL, return a transcript string.

export async function transcribe(_mediaUrl: string): Promise<never> {
  throw new Error("transcribe not implemented yet (Phase 4).");
}
