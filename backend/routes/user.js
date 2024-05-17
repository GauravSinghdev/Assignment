const express = require("express");
const zod = require("zod");
const { User } = require("../db");
const jwt = require("jsonwebtoken")
const JWT_SECRET = require("../config");
const router = express.Router();
const bcrypt = require('bcrypt');
const  { authMiddleware } = require("./middleware");

const registrationSchema = zod.object({
    username: zod.string(),
    email: zod.string().email(),
    password: zod.string().min(6),
})

const isLogin = false; 
const tokenBlacklist = [];
//registration route
router.post("/registration", async (req, res) => {
    try{
        const { success } = registrationSchema.safeParse(req.body);
        console.log(success);
        if (!success) {
            return res.status(400).json({
                message: "Incorrect inputs"
            });
        }
    
        const existingEmail = await User.findOne({
            email: req.body.email
        });

        const existingUsername = await User.findOne({
            username: req.body.username
        });
    
        if (existingEmail || existingUsername) {
            return res.status(409).json({
                message: "Email/username already taken or Incorrect inputs"
            });
        }    
        
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
    
        const user = await User.create({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
        })
        const userId = user._id;
    
        const token = jwt.sign({
            userId
        }, JWT_SECRET);
    
        res.status(201).json({
            message: "User created successfully",
            token: token
        })
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

const loginSchema = zod.object({
    
    username: zod.string().optional(),
    email: zod.string().email().optional(),
    password: zod.string(),
})

//login routes

router.post("/login", async (req,res) => {
    try {
        const { success } = loginSchema.safeParse(req.body);
        console.log(success);
        if (!success) {
            return res.status(400).json({
                message: "Incorrect inputs"
            });
        }
        const { username, email, password } = req.body;

        // Find user by username or email
        const user = await User.findOne({ $or: [{ email }, { username }] });

        if(!user)
        {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        
        if (!user || !passwordMatch) {
            return res.status(401).json({ message: "Invalid username or password" });
        }
    
        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, JWT_SECRET);

        res.status(200).json({ message: "User logged in successfully", token });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal Server Error" });
        }
});

// logout route


router.post('/logout', authMiddleware, (req, res) => {
    try {
        // res.clearCookie('token'); can clear the cookie to remove the token

        if(isLogin)
        {
            isLogin = true;
            const token = req.headers.authorization.split(" ")[1];
            tokenBlacklist.push(token);
            return res.json({ message: "Logout successful" });
        }
        else
            return res.json({ message: "No user is logged in!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post("/profile", authMiddleware, async (req, res) => {
    try {

        const token = req.headers.authorization.split(" ")[1];

        if(tokenBlacklist.includes(token))
            return res.status(401).json({
                message: "User is logged out! Please login again!"
        });

        const userId = req.userId;

        const user = await User.findById(userId, { password: 0, __v: 0, _id: 0});

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ 
            user,
            message: "Password is hidden"});
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ 
            message: "Internal Server Error" 
        });
    }
})

module.exports = router;

