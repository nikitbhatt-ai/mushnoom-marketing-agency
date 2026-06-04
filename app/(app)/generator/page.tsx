import { GeneratorClient } from "@/components/GeneratorClient";
import {
  getClientBrandVoice,
  getContentItems,
  getSourceFiles,
} from "@/lib/db/queries";

export const dynamic = "force-dynamic";

// Server component: fetch sources, the existing content pool, and the editable
// brand voice from Supabase, then hand off to the interactive client.
export default async function GeneratorPage() {
  const [sources, pool, brandVoice] = await Promise.all([
    getSourceFiles(),
    getContentItems(),
    getClientBrandVoice(),
  ]);
  return (
    <GeneratorClient sources={sources} pool={pool} brandVoice={brandVoice} />
  );
}
