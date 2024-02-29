const bcrypt = require("bcrypt");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
require('dotenv').config();

// signup
exports.signup = async (req, res) => {
    try {
        //get data
        const { name, email, password, role } = req.body;
        //check if user already exist
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already Exists',
            });
        }

        //secure password
        let hashedPassword;
        try {
            hashedPassword = await bcrypt.hash(password, 10);
        }
        catch (err) {
            return res.status(500).json({
                success: false,
                message: 'Error inn hashing Password',
            });
        }

        //create entry for User
        const user = await User.create({
            name, email, password: hashedPassword, role
        })

        return res.status(200).json({
            success: true,
            message: 'User Created Successfully',
        });

    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'User cannot be registered, please try again later',
        });
    }
}


// login
exports.login = async (req, res) => {

    try {

        // data fetch
        const { email, password } = req.body;
        // validation on email and password
        if (!email && !password) {
            return res.status(400).json({
                success: false,
                message: "please enter the credentials",
            });
        }

        // check for valid user
        let knownuser = await User.findOne({ email });
        // if not registered user
        if (!knownuser) {
            return res.status(401).json({
                success: false,
                message: "no user with this credentials found"
            })
        }

        const payload = {
            email: knownuser.email,
            id: knownuser._id,
            role: knownuser.role,
        }

        // verify password and generate a jwt token
        if (await bcrypt.compare(password, knownuser.password)) {
            // password verified
            let token = jwt.sign(payload,
                process.env.JWT_SECRET,
                {
                    expiresIn: "2h"
                })
            knownuser=knownuser.toObject();
            knownuser.token = token;
            knownuser.password = undefined;
            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly:true,
            }

            res.cookie("Dipcookie",token,options).status(200).json({
                success:true,
                token,
                knownuser,
                message:"user logged in successfully"
            });

        }

        else{
            // password do not match
            return res.status(403).json({
                success:false,
                message:"password incorrect",
            })
        }

    }

    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'User cannot be registered, please try again later',
        });

    }
}