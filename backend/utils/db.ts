
import mongoose from "mongoose"


export const connectDB=async(url: string)=>{
    mongoose.connect(url).then((resolve)=>{
        console.log("db connection is made successfully")
    }).catch((error)=>{
        console.log(error)
    })
}