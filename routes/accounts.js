const express = require("express");
const { authmiddleware } = require("../middleware");
const { Account, User } = require("../db");
const { default: mongoose } = require("mongoose");
const accountRouter = express.Router()

accountRouter.get("/balance",authmiddleware,async (req, res)=>{
    const account = await Account.findOne({
        userid : req.userid
    })
    const name = await User.findOne({
        _id : req.userid
    })
    res.json({
        balance : account.balance,
        name : name.firstname
    })
})

accountRouter.post("/transfer",authmiddleware,async (req,res)=>{
    const session = await mongoose.startSession()

    session.startTransaction();
    const {amount,to} = req.body

    const account = await Account.findOne({userid : req.userid}).session(session)

    if(!account || account.balance < amount || amount<0){
        await session.abortTransaction();
        return res.status(400).json({
            msg : "Insufficient Balance"
        })
    }

    const toAccount = await Account.findOne({userid: to}).session(session)

    if(!toAccount){
        await session.abortTransaction();
        return res.status(400).json({
            msg : "Account does not exist the one you are sending to"
        })
    }

    //transactions
    await Account.updateOne({userid : to},{$inc : {balance : amount}}).session(session)
    await Account.updateOne({userid : req.userid}, {$inc : {balance : -amount}}).session(session)

    await session.commitTransaction();
    res.json({
        msg : "transfer completed successfully"
    })
})

module.exports = accountRouter;


//how the frick does req.userid get the valuse of senders id i dont get it