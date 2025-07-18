const express = require("express");
const zod = require("zod")
const userRouter = express.Router()
const { User, Account } = require("../db")
const jwt = require("jsonwebtoken");
const JWT_SECRET = require("../config");
const { authmiddleware } = require("../middleware");

const userSchema = zod.object({
    passward: zod.string(),
    username: zod.string().email(),
    lastname: zod.string(),
    firstname: zod.string()
})

const userSchema2 = zod.object({
    passward: zod.string(),
    username: zod.string().email()
})

userRouter.post("/signin", async (req, res) => {
    const { success } = userSchema2.safeParse(req.body)

    if (!success) {
        return res.json({
            msg: "Incorrect Inputs"
        })
    }

    const user = await User.findOne({
        username : req.body.username,
        passward : req.body.passward
    })

    if(user){
        const token = jwt.sign({
            userid : user._id
        },JWT_SECRET)
        res.json({
            token
        })
        return;
    }

    res.json({
        msg : "no such user exist"
    })
})

userRouter.post("/signup", async (req, res) => {
    const body = req.body
    const { success } = userSchema.safeParse(req.body)
    if (!success) {
        return res.json({
            msg: "Incorrect Inputs"
        })
    }

    const user = await User.findOne({
        username: body.username
    })
    
    if (user) {
        return res.status(409).json({
            msg: "email already taken"
        })
    }

    const dbUser = await User.create(body)

    await Account.create({
        userid : dbUser._id,
        balance: 1 + Math.random()*10000
    })

    const token = jwt.sign({
        userid: dbUser._id
    }, JWT_SECRET)

    res.json({
        msg: "user created successfully",
        token: token
    })
})

userRouter.put("/", authmiddleware, async (req, res) => {

    const changeSchema = zod.object({
        passward: zod.string().optional(),
        firstname: zod.string().optional(),
        lastname: zod.string().optional(),
        passward: zod.string().optional()
    })

    const { success } = changeSchema.safeParse(req.body)

    if (!success) {
        return res.status(403).json({
            msg: "something went wrong while updating information"
        })
    }

    await User.updateOne(req.body, {
        _id: req.userid
    })

    res.json({
        mgs: "user updated successfully"
    })
})

userRouter.get('/bulk', async (req, res) => {
    //this is not clear
    const filter = req.query.filter || "";

    const users = await User.find({
        $or: [{
            firstname: {
                "$regex": filter
            }
        }, {
            lastname: {
                "$regex": filter
            }
        }
        ]
    })

    res.json({
        user: users.map(user => ({
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname,
            _id: user._id
        }))
    })
})

module.exports = userRouter
