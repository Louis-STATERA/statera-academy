import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { parse as parseCookieHeader } from "cookie";
import { nanoid } from "nanoid";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // No valid Manus session. This is expected when the app runs outside
    // the Manus platform, since its OAuth backend (OAUTH_SERVER_URL) isn't
    // reachable from here. Fall back to an anonymous "guest" identity
    // stored in a cookie so progress-tracking and diploma features keep
    // working without requiring a Manus login.
    user = await getOrCreateGuestUser(opts.req, opts.res);
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}

async function getOrCreateGuestUser(
  req: CreateExpressContextOptions["req"],
  res: CreateExpressContextOptions["res"]
): Promise<User | null> {
  try {
    const cookies = parseCookieHeader(req.headers.cookie ?? "");
    let guestId = cookies[COOKIE_NAME];

    if (guestId) {
      const existing = await db.getUserByOpenId(guestId);
      if (existing) return existing;
    }

    guestId = `guest_${nanoid(21)}`;
    await db.upsertUser({
      openId: guestId,
      name: "Invité",
      loginMethod: "guest",
      lastSignedIn: new Date(),
    });

    const cookieOptions = getSessionCookieOptions(req);
    res.cookie(COOKIE_NAME, guestId, { ...cookieOptions, maxAge: ONE_YEAR_MS });

    return (await db.getUserByOpenId(guestId)) ?? null;
  } catch (error) {
    console.error("[Auth] Failed to create guest user:", error);
    return null;
  }
}
