import { gqlRequest } from "@/lib/graphql/client";
import { STATS_QUERY } from "@/lib/graphql/queries";
import type { Stats } from "@/types";

export async function fetchStats(): Promise<Stats> {
  const data = await gqlRequest<{ stats: Stats }>(STATS_QUERY);
  return data.stats;
}
