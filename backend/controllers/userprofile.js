const Users = require('../models/User');
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.userprofile = async (req, res) => {
    try{ console.log("1");
        const token = req.cookies.loginAuthToken || req.cookies.signupAuthToken;
        if(!token){
            return res.status(401).json({
                success:false,
                message:"Unauthorized Access",
            })
        }
        console.log("1");
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const users = await Users.find({})
                                        .select("-password");
        console.log("1");
        
        const email = decoded.email;
        console.log("1");
                                    
        return res.status(200).json({
            success:true,
            message:"User profile fetched successfully",
            users,
            email,
        })
    }
    catch(error){
        return res.status(401).json({
            success:false,
            message:error.message,
        })
    }
} 

exports.userprofilebyid = async (req, res) => {
    try{
         const { userId } = req.body;
        const user = await Users.findById( userId ).select("-password");
        return res.status(200).json({
            success:true,
            message:"User profile fetched successfully",
            user,
        })
    }
    catch(error){
        return res.status(401).json({
            success:false,
            message:error.message,
        })
    }
}
