

import express from "express";  
import { loginUser, registerUser, subscribe, getUserByID} from "../controllers/userController";
import auth from "../middleware/auth";

const userrouter=express.Router();

userrouter.post("/register", registerUser);

userrouter.post("/login", loginUser);

userrouter.get("/:id", auth, getUserByID);



userrouter.post("/subscribe/:id",auth,subscribe )



export default userrouter;

