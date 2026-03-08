import type { RedisClientType } from "redis";
import { getRedisClient } from "./redisClient";

export const POST_NOTIFICATION_QUEUE = "post_notifications_queue";

export type PostNotificationEvent = {
  type: "NEW_POST";
  postId: string;
  ownerId: string;
  createdAt: string;
};

export const enqueuePostNotification = async (
  event: PostNotificationEvent
): Promise<void> => {
  let client: RedisClientType | null = null;
  try {
    client = await getRedisClient();
    const payload = JSON.stringify(event);
    await client.lPush(POST_NOTIFICATION_QUEUE, payload);
  } catch (err) {
    console.error("[Queue] Failed to enqueue post notification", err);
  }
};

