import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { createYoga } from "graphql-yoga";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { typeDefs } from "./graphql/typeDefs.js";
import { resolvers } from "./graphql/resolvers.js";
import { createContext } from "./graphql/context.js";

const schema = makeExecutableSchema({ typeDefs, resolvers });

const yoga = createYoga({
  schema,
  context: ({ request }) => createContext(request),
  graphqlEndpoint: "/graphql",
  landingPage: false,
});

const app = new Hono();

app.get("/health", (c) => c.json({ status: "ok" }));

app.on(["GET", "POST", "OPTIONS"], "/graphql", (c) => yoga.fetch(c.req.raw));

const port = Number(process.env.PORT ?? 4000);

serve({ fetch: app.fetch, port }, () => {
  console.log(`🚀 Meal Planner API ready at http://localhost:${port}/graphql`);
});
