import type { RedisClientType } from "redis";
import { getRedisClient } from "./redisClient";

export const EMAIL_QUEUE = "email_queue";

export type EmailJob = {
  to: string;
  subject: string;
  text: string;
};

export const enqueueEmail = async (job: EmailJob): Promise<void> => {
  let client: RedisClientType | null = null;
  try {
    client = await getRedisClient();
    const payload = JSON.stringify(job);
    await client.lPush(EMAIL_QUEUE, payload);
  } catch (err) {
    console.error("[Queue] Failed to enqueue email job", err);
  }
};

