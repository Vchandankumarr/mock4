const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticate = (req,res,next) =>{
    let token = req.headers.authorization;
    if(token){
        jwt.verify(token, process.env.secret , (err, decoded)=>{
            if(err){
                res.status(403).send({msg:err})
            }else{
                req.body.userID = decoded.userID      
                req.body.email = decoded.email;
                next()
            }
          });
    }else[
        res.status(403).send({msg:"Access Denied"})
    ]
}

module.exports = {authenticate}