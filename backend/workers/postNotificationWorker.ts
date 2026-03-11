
import mongoose from "mongoose";
import { createClient } from "redis";
import {
  POST_NOTIFICATION_QUEUE,
  type PostNotificationEvent,
} from "../utils/notificationQueue";
import { connectDB } from "../utils/db";
import usermodel from "../model/UserSchema";
import { postModel } from "../model/PostSchema";
import { subscriberModel } from "../model/SubscriberSchema";
import { enqueueEmail } from "../utils/emailQueue";

const createRedisConsumerClient = () => {
  const url =
    process.env.REDIS_URL ??
    `redis://${process.env.REDIS_HOST ?? "127.0.0.1"}:${process.env.REDIS_PORT ?? "6379"}`;

  const client = createClient({ url });

  client.on("error", (err) => {
    console.error("[Worker][Redis] Client error", err);
  });

  return client;
};

const run = async () => {
  const mongoUrl = process.env.MONGO_URL || "mongodb+srv://piyushsunnyst:piyushsunnyst@cluster0.gqoh6cx.mongodb.net/";
  if (!mongoUrl) {
    console.error("[Worker] MONGO_URL is not set");
    process.exit(1);
  }

  await connectDB(mongoUrl);

  const redis = createRedisConsumerClient();
  await redis.connect();
  console.log("[Worker] Connected to Redis and Mongo, starting consumer loop");

  while (true) {
    try {
      const result = await redis.brPop(POST_NOTIFICATION_QUEUE, 0);
      if (!result) {
        continue;
      }

      const message = result.element;
      let event: PostNotificationEvent;

      try {
        event = JSON.parse(message) as PostNotificationEvent;
      } catch (err) {
        console.error("[Worker] Failed to parse event", err, message);
        continue;
      }

      if (event.type !== "NEW_POST") {
        console.warn("[Worker] Unknown event type", event.type);
        continue;
      }

      const { postId, ownerId } = event;

      const [post, owner] = await Promise.all([
        postModel.findById(postId),
        usermodel.findById(ownerId),
      ]);

      if (!post || !owner) {
        console.warn("[Worker] Post or owner not found for event", event);
        continue;
      }

      // Find the creator's Subscribers document
      // const creatorSubscribersDoc = await subscriberModel.findById(owner._id);
      // if (!creatorSubscribersDoc) {
      //   console.log("[Worker] No subscribers doc for owner, skipping", owner.username);
      //   continue;
      // }

      // Load all users that have subscribed to this creator
      await owner.populate("subscribers");
      const subscribers = (owner as any).subscribers as any[];

      if (!subscribers || !subscribers.length) {
        console.log(
          `[Worker] No subscribers found for creator ${owner.username} on post ${post.title}`
        );
        continue;
      }

      const subject = `New post from ${owner.username}: ${post.title}`;
      const body = `Hi,

${owner.username} just published a new post: "${post.title}".

Visit the app to read it.`;

      for (const subscriber of subscribers) {
        const to = subscriber.email ?? subscriber.username;
        await enqueueEmail({ to, subject, text: body });
        console.log(
          `[Notification] Queued email for new post "${post.title}" from "${owner.username}" to subscriber "${to}"`
        );
      }
    } catch (err) {
      console.error("[Worker] Error in consumer loop", err);
    }
  }
};

run().catch((err) => {
  console.error("[Worker] Fatal error", err);
  mongoose.connection.close().finally(() => {
    process.exit(1);
  });
});

