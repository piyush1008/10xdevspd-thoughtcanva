import type { Request, Response } from "express";
import mongoose from "mongoose";
import usermodel from "../model/UserSchema";
import bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { subscriberModel } from "../model/SubscriberSchema";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { username, password, imageURL , creater} = req.body;
    console.log(username +" "+ creater);

    const hashpassword = await bcrypt.hash(password, 10);
    await usermodel.create({
      username: username,
      password: hashpassword,
      imageURl: imageURL,
      creater: creater
    });

    return res.status(200).json({
      message: "user is registerd successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const existingUser = await usermodel.findOne({
      username: username,
    });

    if (!existingUser) {
      return res.status(403).json({
        message: "Incorrect username",
      });
    }
    const hash = await bcrypt.hash(password, 10);
    const hashpassword = await bcrypt.compare(password, hash);
    if (!hashpassword) {
      return res.status(403).json({
        message: "password is incorrect",
      });
    }
    const token = jwt.sign(
      { _id: existingUser._id },
      process.env.JWT_SECRET || "mysecretpassword"
    );
    console.log(token);
    return res.status(200).json({
      token: token,
      user:existingUser
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
//6986e14e9f2486965bf6cea6

export const logoutUser = async (req: Request, res: Response) => {
  try {
    return res.status(200).json({
      message: "logout not implemented yet",
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const subscribe = async (req: Request, res: Response) => {
  try {
    const creatorId = req.params.id;
    const subscriberId = req.userId

    if (!subscriberId) {
      return res.status(401).json({
        message: "Unauthorized: missing user context",
      });
    }

    if (!mongoose.isValidObjectId(creatorId)) {
      return res.status(400).json({
        message: "Invalid creator id",
      });
    }

    if (creatorId === subscriberId) {
      return res.status(400).json({
        message: "You cannot subscribe to yourself",
      });
    }//69ad087fa50f3a76798e4b06

    const [subscriberUser, creatorUser] = await Promise.all([
      usermodel.findById(subscriberId),
      usermodel.findById(creatorId),
    ]);

    if (!subscriberUser || !creatorUser) {
      return res.status(404).json({
        message: "Subscriber or creator not found",
      });
    }

    if (!creatorUser.creater) {
      return res.status(403).json({
        message: "You can only subscribe to creators",
      });
    }

    // Ensure a Subscribers doc exists for the creator
    let creatorSubscribersDoc = await subscriberModel.findById(creatorUser._id);
    if (!creatorSubscribersDoc) {
      creatorSubscribersDoc = await subscriberModel.create({
        _id: creatorUser._id,
        username: creatorUser.username,
      });
    }

    const alreadySubscribed = subscriberUser.subscriberTo?.some((ref: any) =>
      ref.equals
        ? ref.equals(creatorSubscribersDoc!._id)
        : String(ref) === String(creatorSubscribersDoc!._id)
    );

    if (!alreadySubscribed) {
      // @ts-ignore
      subscriberUser.subscriberTo.push(creatorSubscribersDoc._id);
      await subscriberUser.save();

      const alreadyInCreatorSubscribers = creatorUser.subscribers?.some((ref: any) =>
        ref.equals
          ? ref.equals(subscriberUser._id)
          : String(ref) === String(subscriberUser._id)
      );
      if (!alreadyInCreatorSubscribers) {
        creatorUser.subscribers.push(subscriberUser._id);
        await creatorUser.save();
      }
    }

    return res.status(200).json({
      message: "Subscribed successfully",

    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
};



export const getUserByID=async(req: Request, res: Response)=>{
    try {

        const id=req.params.id;

        const user=await usermodel.findById({
            _id: id
        });
        
        return res.status(200).json({
            user
        })

    } 
    catch (error) {
         return res.status(500).json({
            message: error
         })
    }
}