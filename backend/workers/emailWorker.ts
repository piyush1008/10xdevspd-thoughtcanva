import "dotenv/config";
import { createClient } from "redis";
import { EMAIL_QUEUE, type EmailJob } from "../utils/emailQueue";
import { sendEmail } from "../utils/email";

const createRedisConsumerClient = () => {
  const url =
    process.env.REDIS_URL ??
    `redis://${process.env.REDIS_HOST ?? "127.0.0.1"}:${process.env.REDIS_PORT ?? "6379"}`;

  const client = createClient({ url });

  client.on("error", (err) => {
    console.error("[EmailWorker][Redis] Client error", err);
  });

  return client;
};

const run = async () => {
  const redis = createRedisConsumerClient();
  await redis.connect();
  console.log("[EmailWorker] Connected to Redis, starting email consumer loop");

  while (true) {
    try {
      const result = await redis.brPop(EMAIL_QUEUE, 0);
      if (!result) {
        continue;
      }

      const message = result.element;
      let job: EmailJob;

      try {
        job = JSON.parse(message) as EmailJob;
      } catch (err) {
        console.error("[EmailWorker] Failed to parse email job", err, message);
        continue;
      }

      await sendEmail(job.to, job.subject, job.text);
    } catch (err) {
      console.error("[EmailWorker] Error in consumer loop", err);
    }
  }
};

run().catch((err) => {
  console.error("[EmailWorker] Fatal error", err);
  process.exit(1);
});

