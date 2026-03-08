import type { Request, Response } from "express";



export const errorHandler=(req: Request, res: Response, error:Error)=>{

    return res.status(500).json({
        error:error.message
    })
}