import { createHash } from "node:crypto";
import { db } from "@/lib/db";

type LimitOptions = {
  action: string;
  identifier: string;
  limit: number;
  windowMinutes?: number;
};

export async function checkRateLimit({
  action,
  identifier,
  limit,
  windowMinutes = 15
}: LimitOptions) {
  const windowMs = windowMinutes * 60 * 1000;
  const windowStart = new Date(Math.floor(Date.now() / windowMs) * windowMs);
  const keyHash = createHash("sha256").update(identifier.toLowerCase()).digest("hex");
  const entry = await db.rateLimit.upsert({
    where: { keyHash_action_windowStart: { keyHash, action, windowStart } },
    create: { keyHash, action, windowStart },
    update: { count: { increment: 1 } },
    select: { count: true }
  });
  return entry.count <= limit;
}
