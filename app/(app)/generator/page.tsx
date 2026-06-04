import { GeneratorClient } from "@/components/GeneratorClient";
import { getContentItems, getSourceFiles } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

// Server component: fetch sources + the existing content pool from Supabase,
// then hand off to the interactive client. Phase 3 swaps the client's simulated
// generate() for a real POST /api/generate.
export default async function GeneratorPage() {
  const [sources, pool] = await Promise.all([
    getSourceFiles(),
    getContentItems(),
  ]);
  return <GeneratorClient sources={sources} pool={pool} />;
}
