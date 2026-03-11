# Backend Architecture

This document describes the **backend** under `backend/` (Express + MongoDB + Redis queues + workers).

## High-level flow diagram

```mermaid
flowchart TD
  %% Clients
  Client[Client (Web/Mobile)] -->|HTTP JSON| API[Express API\nbackend/index.ts]

  %% Middleware & routing
  API --> Routes[Routers\nUserRouter / PostRouter / summarizeRouter]
  Routes --> Auth[JWT auth middleware\nbackend/middleware/auth.ts]

  %% Controllers
  Auth --> UserCtrl[UserController\nregister/login/getUser/subscribe]
  Auth --> PostCtrl[PostController\ncreatePost/getPost/createComment/getAllPost]
  Auth --> SumCtrl[SummarizeController\nsummarizetext]

  %% Data layer
  UserCtrl --> Mongo[(MongoDB via Mongoose)]
  PostCtrl --> Mongo
  SumCtrl --> LLM[LangChain + Groq model\nutils/summarize.ts]

  Mongo --> UserModel[User model\nmodel/UserSchema.ts]
  Mongo --> PostModel[Post model\nmodel/PostSchema.ts]
  Mongo --> SubscribersModel[Subscribers model\nmodel/SubscriberSchema.ts]

  %% Async notifications pipeline
  PostCtrl -->|enqueuePostNotification| Redis[(Redis)]
  Redis -->|LPUSH post_notifications_queue| PostQueue[post_notifications_queue\nutils/notificationQueue.ts]

  PostWorker[postNotificationWorker.ts\nconsumer loop] -->|BRPOP post_notifications_queue| Redis
  PostWorker --> Mongo
  PostWorker -->|enqueueEmail| Redis

  EmailWorker[emailWorker.ts\nconsumer loop] -->|BRPOP email_queue| Redis
  EmailWorker --> Mail[Nodemailer Gmail OAuth2\nutils/email.ts]

  %% Observability-ish
  API --> Health[/GET /health/]
```

## LLD diagram (modules and key dependencies)

```mermaid
classDiagram
  direction LR

  class ExpressApp {
    +app: Express
    +GET /health
    +/api/v1/user
    +/api/v1/post
    +/api/v1/summarize
  }

  class UserRouter {
    +POST /register
    +POST /login
    +GET /:id (auth)
    +POST /subscribe/:id (auth)
  }
  class PostRouter {
    +POST /create (auth)
    +GET /posts/:id (auth)
    +POST /comment/:id (auth)
    +GET /getAllPost (auth)
  }
  class SummarizeRouter {
    +POST / (auth)
  }

  class AuthMiddleware {
    +auth(req,res,next)
    req.userId <- JWT _id
  }

  class UserController {
    +registerUser(req,res)
    +loginUser(req,res)
    +getUserByID(req,res)
    +subscribe(req,res)
  }
  class PostController {
    +createPost(req,res)
    +getAllPost(req,res)
    +getPostId(req,res)
    +createComment(req,res)
  }
  class SummarizeController {
    +summarizetext(req,res)
  }

  class ConnectDB {
    +connectDB(mongoUrl)
  }

  class RedisClient {
    +getRedisClient()
  }
  class NotificationQueue {
    +POST_NOTIFICATION_QUEUE
    +enqueuePostNotification(event)
  }
  class EmailQueue {
    +EMAIL_QUEUE
    +enqueueEmail(job)
  }

  class PostNotificationWorker {
    +run()
    +brPop(POST_NOTIFICATION_QUEUE)
    +enqueueEmail(to,subject,text)
  }
  class EmailWorker {
    +run()
    +brPop(EMAIL_QUEUE)
    +sendEmail(to,subject,text)
  }

  class EmailUtil {
    +sendEmail(to,subject,text)
  }

  class SummarizeUtil {
    +summarizeText(text)
  }
  class SummarizationChain {
    +invoke(input_documents)
  }
  class GroqModel {
    +ChatGroq(model, temperature)
  }
  class TextSplitter {
    +createDocuments([text])
  }

  class UserModel
  class PostModel
  class SubscribersModel

  ExpressApp --> ConnectDB : calls
  ExpressApp --> UserRouter : mounts
  ExpressApp --> PostRouter : mounts
  ExpressApp --> SummarizeRouter : mounts

  UserRouter --> AuthMiddleware : uses
  PostRouter --> AuthMiddleware : uses
  SummarizeRouter --> AuthMiddleware : uses

  UserRouter --> UserController : calls
  PostRouter --> PostController : calls
  SummarizeRouter --> SummarizeController : calls

  UserController --> UserModel : CRUD
  UserController --> SubscribersModel : create/find
  UserController --> PostModel : (via User.posts refs)

  PostController --> PostModel : CRUD
  PostController --> UserModel : push post ref
  PostController --> NotificationQueue : enqueue

  NotificationQueue --> RedisClient : get client
  EmailQueue --> RedisClient : get client

  PostNotificationWorker --> RedisClient : consumer client
  PostNotificationWorker --> UserModel : load owner + subscribers
  PostNotificationWorker --> PostModel : load post
  PostNotificationWorker --> EmailQueue : enqueue jobs

  EmailWorker --> RedisClient : consumer client
  EmailWorker --> EmailUtil : send

  SummarizeController --> SummarizeUtil : calls
  SummarizeUtil --> TextSplitter : splits
  SummarizeUtil --> SummarizationChain : invoke
  SummarizationChain --> GroqModel : LLM
```

## Notes / runtime responsibilities

- **API process**: serves HTTP; authenticates via JWT; writes/reads MongoDB; enqueues background work to Redis.
- **`postNotificationWorker.ts`**: consumes `post_notifications_queue`, loads the post + creator + subscribers, and enqueues email jobs.
- **`emailWorker.ts`**: consumes `email_queue` and sends email via Nodemailer (Gmail OAuth2 env vars).

