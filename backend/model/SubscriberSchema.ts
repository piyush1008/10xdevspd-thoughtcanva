import mongoose, { Mongoose } from "mongoose";


const Subscribers=new mongoose.Schema({
    _id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    username:{
        type: String, 
        require: true
    }
})

export const subscriberModel=mongoose.model("Subscribers", Subscribers)

