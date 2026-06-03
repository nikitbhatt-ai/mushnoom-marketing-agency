// Google Drive ingestion — wired in Phase 4.
// Poll the connected Drive folder (or use a webhook) for new source files.
// Orchestrate, don't build (hard rule 5): we call Drive's API, we don't host files.
//
// TODO(Phase 4): list new files in the folder since last ingest, download, and
// insert into source_files. A Canva + Google Drive MCP connection already exists.

export async function listNewSourceFiles(_sinceIso: string): Promise<never> {
  throw new Error("drive.listNewSourceFiles not implemented yet (Phase 4).");
}
