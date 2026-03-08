import express from "express";
import auth from "../middleware/auth";
import { summarizetext } from "../controllers/SummarizeController";

const summarizeRouter=express.Router();

summarizeRouter.post("/", auth, summarizetext)




export default summarizeRouter;