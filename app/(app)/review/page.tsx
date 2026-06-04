import { ReviewClient } from "@/components/ReviewClient";
import { getContentItems } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

// Server component: load the items currently in review from Supabase, hand off
// to the interactive client. Phase 5 persists approve/reject back to the DB.
export default async function ReviewPage() {
  const items = await getContentItems();
  const inReview = items.filter((c) => c.status === "in_review");
  return <ReviewClient initial={inReview} />;
}
