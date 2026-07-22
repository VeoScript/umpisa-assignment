import { gqlRequest } from "@/lib/graphql/client";
import { LOGIN_MUTATION, REGISTER_MUTATION } from "@/lib/graphql/mutations";
import { ME_QUERY } from "@/lib/graphql/queries";
import type { AuthPayload, User } from "@/types";

export async function login(input: {
  email: string;
  password: string;
}): Promise<AuthPayload> {
  const data = await gqlRequest<{ login: AuthPayload }>(LOGIN_MUTATION, input);
  return data.login;
}

export async function register(input: {
  email: string;
  password: string;
  name: string;
}): Promise<AuthPayload> {
  const data = await gqlRequest<{ register: AuthPayload }>(
    REGISTER_MUTATION,
    input
  );
  return data.register;
}

export async function fetchMe(): Promise<User> {
  const data = await gqlRequest<{ me: User }>(ME_QUERY);
  return data.me;
}
