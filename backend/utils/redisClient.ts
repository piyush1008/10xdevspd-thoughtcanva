import { createClient, type RedisClientType } from "redis";

let client: RedisClientType | null = null;

// export const getRedisClient = async (): Promise<RedisClientType> => {
//   if (client && client.isOpen) {
//     return client;
//   }

//   const url =
//     process.env.REDIS_URL ??
//     `redis://${process.env.REDIS_HOST ?? "127.0.0.1"}:${process.env.REDIS_PORT ?? "6379"}`;

//   client = createClient({
//     url,
//   });

//   client.on("error", (err) => {
//     console.error("[Redis] Client error", err);
//   });

//   if (!client.isOpen) {
//     await client.connect();
//     console.log("[Redis] Connected", url);
//   }

//   return client;
// };


  export const getRedisClient=async()=>{

    if(client && client.isOpen)
    {
      return client;
    }

    const url=process.env.REDIS_URL ?? `redis://${process.env.REDIS_HOST ?? "127.0.0.1"}:${process.env.REDIS_PORT ?? "6379"}`;

    client=createClient({url})

    client.on("error",(err)=>{
      console.log(`[redis] client error ${err}`)
    })

    if(!client.isOpen)
    {
      await client.connect();
      console.log(`[Redis] connnected ${url}`)
    }

    return client;

}
