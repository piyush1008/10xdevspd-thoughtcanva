import type { Request, Response } from "express";
import { summarizeText } from "../utils/summarize";


export const summarizetext=async(req:Request,res:Response)=>{
    try {
        const {text}=req.body;

        const summary=await summarizeText(text);

        return res.status(200).json({
            summary
        })
    } 
    catch (error) {
        return res.status(500).json({
            message: error
        })
    }   
}