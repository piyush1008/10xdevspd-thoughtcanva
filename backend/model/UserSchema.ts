import mongoose from "mongoose";



const UserSchema=new mongoose.Schema({
    username:{
        type:String,
        require:true
    },
    password:{
        type: String
    }, 
    posts:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        }
    ], 
    subscriberTo:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subscribers"
        }
    ],
    creater:{
        type: Boolean,
        default: false
    },
    subscribers:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    imageURl:{
        type: String, 
        
    }
    
})

const usermodel=mongoose.model("User", UserSchema);

export default usermodel;