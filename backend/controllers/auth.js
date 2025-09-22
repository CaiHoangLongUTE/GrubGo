import User from "../models/user.js";
import bcrypt from "bcryptjs";
import genToken from "../utils/token.js";

export const signIn = async (req, res) => {
    try {
        const {fullName, email, password, mobile, role} = req.body;
        const user = await User.findOne({email});
        if(!user) {
            return res.status(400).json({message: "User does not exists"});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return res.status(400).json({message: "Incorrect password"});
        }

        const token = await genToken(user._id);
        res.cookie("token", token, {
            secure: false,
            sameSite: "strict",
            maxAge: 7*24*60*60*1000,    
            httpOnly: true
        });

        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json(`Sign in failed. Error: ${error.message}`);
    }
};

export const signUp = async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email});
        if(user) {
            return res.status(400).json({message: "User already exists"});
        }
        if(password.length < 6) {
            return res.status(400).json({message: "Password must be at least 6 characters"});
        }
        if(mobile.length < 10) {
            return res.status(400).json({message: "Mobile number must be at least 10 characters"});
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user = await User.create({
            fullName,
            email,
            password: hashedPassword,
            mobile,
            role
        });

        const token = await genToken(user._id);
        res.cookie("token", token, {
            secure: false,
            sameSite: "strict",
            maxAge: 7*24*60*60*1000,
            httpOnly: true
        });

        return res.status(201).json(user);
    } catch (error) {
        return res.status(500).json(`Sign up failed. Error: ${error.message}`);
    }
};

export const signOut = async (req, res) => {
    try {
        res.clearCookie("token");
        return res.status(200).json({message: "Log out successfully"});
    } catch (error) {
        return res.status(500).json(`Sign out failed. Error: ${error.message}`);
    }
};

