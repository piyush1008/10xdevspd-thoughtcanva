import type { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";


export default function auth(req:Request, res: Response, next:NextFunction){
    try{

        const header=req.headers.authorization;
        // console.log(header);
        const token=header?.split(" ")[1];
        console.log(`token is ${token}`)
        if(!token)
        {
            return res.status(400).json({
                message : "Please sign in first"
            })
        }
        const user=jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;
        
        req.userId=user._id;

        next();


    }
    catch(error)
    {

        console.log(error)
    }
}