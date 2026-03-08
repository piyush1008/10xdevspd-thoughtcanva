import mongoose from "mongoose";


const PostSchema=new mongoose.Schema({
    title: {
        required: true, 
        type: String
    },
    description:{
        required: true,
        type: String
    },
    createdAt:{
        type: Date, 
        default: Date.now
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    comments:[
        {
            user:{
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }, 
            comment:{
                type: String, 
                required: true
            }
        }
    ]
})


export const postModel=mongoose.model("Post", PostSchema);