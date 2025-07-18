
const mongoose = require("mongoose");
const { string, number } = require("zod");

mongoose.connect('mongodb+srv://krishnayadav46846:ClEz8CQXV9OmLlrm@cluster0.kksukgp.mongodb.net/');

const userSchema = new mongoose.Schema({
    username : String,
    passward : String,
    firstname : String,
    lastname : String
})

const accountSchema = new mongoose.Schema({
    userid : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required: true    
    },
    balance :{
        type : Number,
        required: true
    }
})

const User = mongoose.model("User" , userSchema)
const Account = mongoose.model("Account" ,accountSchema)

module.exports = {
    User , Account
}
