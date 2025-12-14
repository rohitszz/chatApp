
const { text } = require("express");
const Message = require("../models/Messages");   

exports.messages = async (req, res) => { 
    try{
        const { senderId, recieverId, text, image } = req.body;

        if (!senderId || !recieverId || (!text && !image)) {
      return res.status(400).json({
        success: false,
        message: "Message must contain text or image",
      });
    }
        const newMessage = await Message.create({
            senderId,
            recieverId,
            text: text || "",
            image: image || null
        });

        return res.status(201).json({
            success:true,
            message:"Message sent successfully",
            newMessage,
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
} 

exports.getMessages = async (req, res) => {
    try{
        const { senderId, recieverId } = req.body;
        const messages = await Message.find({
            $or: [
                { senderId: senderId, recieverId: recieverId },
                { senderId: recieverId, recieverId: senderId },
            ]
        }).sort({ createdAt: 1 });
        return res.status(200).json({
            success:true,
            message:"Messages fetched successfully",
            messages,
        })
        
    }
        catch(error){
            return res,status(500).json({
                success:false,
                message:error.message,
            })
        }

    }

