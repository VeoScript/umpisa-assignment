import { prisma } from "../lib/prisma.js";
import { getUserFromAuthHeader, type JwtPayload } from "../lib/auth.js";

export interface GraphQLContext {
  prisma: typeof prisma;
  user: JwtPayload | null;
}

export function createContext(request: Request): GraphQLContext {
  const authHeader = request.headers.get("authorization");
  const user = getUserFromAuthHeader(authHeader);
  return { prisma, user };
}
