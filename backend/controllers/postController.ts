import type { Request, Response } from "express";
import { postModel } from "../model/PostSchema";
import usermodel from "../model/UserSchema";
import { enqueuePostNotification } from "../utils/notificationQueue";

export const createPost = async (req: Request, res: Response) => {
  try {

    const { title, description } = req.body;

    const owner = req.userId;


    console.log(owner)

    const newPost = await postModel.create({
      title,
      description,
      owner,
    });

    const user = await usermodel.findById(owner);
    if (user) {
      user.posts.push(newPost._id);
      await user.save();
    }

    // Fire-and-forget enqueue of notification event
    if (owner) {
      void enqueuePostNotification({
        type: "NEW_POST",
        postId: String(newPost._id),
        ownerId: String(owner),
        createdAt: new Date().toISOString(),
      });
    }

    return res.status(200).json({
      post: newPost,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error,
    });
  }
};


export const getAllPost=async(req: Request, res: Response)=>{
    try {
        console.log(req.userId)
        const allPost=await postModel.find({
            owner: req.userId
        })

        return res.status(200).json({
            post: allPost
        })
    } 
    catch (error) {
        return res.status(500).json({
            message: error
        })
    }
}


export const getPostId=async(req: Request, res: Response)=>{
    try {
        console.log(req)
        const id=req.params.id;
        console.log(id)
        const post=await postModel.findById({
            _id: id
        });
        
        return res.status(200).json({
            post
        })

    } 
    catch (error) {
         return res.status(500).json({
            message: error
         })
    }
}

export const createComment=async(req:Request, res: Response)=>{
    try {
        const {id}=req.params;
        const {comment}=req.body;
        const post=await postModel.findById({_id: id})
        if(!post)
        {
            return res.status(401).json({
                message: "no post exist"
            })
        }

        post.comments.push({
            user: req.userId, 
            comment: comment
        })

        await post.save();

        return res.status(200).json({
            message: comment
        })


    } 
    catch (error) {
      return res.status(500).json({
        message: error
      })  
    }
}




