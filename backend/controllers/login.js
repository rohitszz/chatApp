const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log("1");
        const user = await User.findOne({ email: email });
        console.log("1");
        
        if(user && await bcrypt.compare( password ,user.password)){
            const loginToken = jwt.sign(
                        { email: email },
                        process.env.JWT_SECRET,
                        { expiresIn: "7d" }
                    )
                   console.log("2");
                    res.cookie("loginAuthToken", loginToken, {
                        httpOnly: true,
                        secure: true,
                        sameSite: "none",
                        path:"/", 
                        maxAge: 7 * 24 * 60 * 60 * 1000
                    })
                    console.log("2");
    
            return res.status(200).json({
                success: true,
                 message: "User Logged in successfully",
            }) 
        }
        else {
            return res.status(401).json({
                success: false,
                message: "Invalid Credentials",

            });

        }
    }
    catch (error) {
          return res.status(401).json({
                success: false,
                message: error.message,
            });
    }
}
