import { Hono } from "hono";
import { auth, type AppEnv } from "../lib/auth";

const authApp = new Hono<AppEnv>()
  .use("*", async (c, next) => {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });
    if (!session) {
      c.set("user", null);
      c.set("session", null);
      return next();
    }
    c.set("user", session.user);
    c.set("session", session.session);
    return next();
  })
  .on(["POST", "GET"], "/auth/*", (c) => {
    return auth.handler(c.req.raw);
  });

export default authApp;
