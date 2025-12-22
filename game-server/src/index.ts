import { serve } from "@hono/node-server";
import { Hono } from "hono";
import fetch from "node-fetch";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/api/authenticate", (c) => {
  return c.text("hello hono");
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
