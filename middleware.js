const jwt = require("jsonwebtoken");
const JWT_SECRET = require("./config");

const authmiddleware = (req , res , next)=>{
    const authHeader = req.headers['autherization']

    if(!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(403).json({})
    }

    const token = authHeader.split(' ')[1]

    try{
        const decoded = jwt.verify(token , JWT_SECRET)
        req.userid = decoded.userid;
        next()
    }catch(err){
        return res.status(403).json({
            msg : "wrong or no auth-token"
        })
    }
}

module.exports={
    authmiddleware
}