import { serve } from "@hono/node-server";
import { Hono } from "hono";
import authenticate from "./middlewares/authenticate.ts";

const app = new Hono();

app.use("/api", authenticate);

// health check
app.get("/", (c) => {
  return c.json({ message: "healthy" }, 200);
});

app.get("/*", (c) => {
  return c.notFound();
});

serve(
  {
    fetch: app.fetch,
    port: 6767,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
