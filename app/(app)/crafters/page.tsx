export const dynamic = "force-dynamic";

import { CraftersClient } from "@/components/crafters/CraftersClient";
import { getCrafterStats } from "@/lib/queries/crafters";

export default async function CraftersPage() {
  const crafters = await getCrafterStats();
  return <CraftersClient crafters={crafters} />;
}
