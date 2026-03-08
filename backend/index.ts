import express from "express";
import userrouter from "./routes/UserRouter";
import { connectDB } from "./utils/db";
import postrouter from "./routes/PostRouter";
import summarizeRouter from "./routes/summarizeRouter";
const app=express();

console.log(process.env.PORT)
app.use(express.json());

connectDB(process.env.MONGO_URL!);

app.get("/health", (req, res) => {
    res.status(200).json({ status: "OK" });
  });

app.use("/api/v1/user", userrouter);

app.use("/api/v1/post", postrouter);

app.use("/api/v1/summarize", summarizeRouter);



app.listen(process.env.PORT,()=>{
    console.log(`Server is running on port ${process.env.PORT}`);
});

// export default app;