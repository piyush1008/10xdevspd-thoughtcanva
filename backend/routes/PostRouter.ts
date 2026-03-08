import express from "express"
import { getActiveResourcesInfo } from "node:process";
import { getAllJSDocTags } from "typescript";
import {  createComment, createPost, getAllPost, getPostId } from "../controllers/postController";
import auth from "../middleware/auth";

const postrouter=express.Router();



postrouter.post("/create",auth,  createPost);

postrouter.get("/posts/:id", auth,getPostId);
postrouter.post("/comment/:id", auth,createComment);


postrouter.get("/getAllPost",auth,  getAllPost);











export default postrouter;