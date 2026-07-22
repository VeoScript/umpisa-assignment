import api from "@/lib/axios";
import type { GraphQLErrorShape } from "@/types";

interface GraphQLResponse<T> {
  data?: T;
  errors?: GraphQLErrorShape[];
}

export async function gqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const { data } = await api.post<GraphQLResponse<T>>("", {
    query,
    variables,
  });

  if (data.errors && data.errors.length > 0) {
    throw new Error(data.errors[0].message);
  }
  if (!data.data) {
    throw new Error("The server returned no data.");
  }
  return data.data;
}
