var middleware = {};
const redisClient = require('./../db/redis');
const jws = require('jws');

middleware.isLoggedIn = function(req,res,next){
    console.log('checking logged in');
    
    let { key } = req.query;
    if(req.isAuthenticated() && req.params.id==req.user.id){
        return next();
    }
    else if( key && jws.verify(key,"HS256","secret key")){
        redisClient.get(req.params.id,(err,reply)=>{
            if(err)
                res.sendStatus(500);
            if(reply==key){
                let user = jws.decode(key);
                user = JSON.parse(user.payload)
                req.user={
                    id: user.id,
                    role: user.role,
                    name: user.name
                }
                next();
            }
            else{
                res.status(401).json({
                    message: "session has expired. login required"
                })
            }   
        })
    } else{
        res.status(401).json({
            message: "login required."
        })
    }
}

middleware.isAdmin = (req,res,next)=>{
    console.log('checking for admin');
    let { key } = req.query;
    if(req.isAuthenticated() && req.params.id==req.user.id && req.user.role=="admin"){
        return next();
    }
    else if( key && jws.verify(key,"HS256","secret key")){
        redisClient.get(req.params.id,(err,reply)=>{
            if(err)
                res.sendStatus(500);
            console.log(reply)
            
            if(reply==key){
                let user = jws.decode(key);
                user = JSON.parse(user.payload)
                req.user={
                    id: user.id,
                    role: user.role,
                    name: user.name
                }
                console.log(req.user)
                if(req.user.role=="admin")
                    next();
                else   
                    res.status(401).json({
                        message: "access denied."
                    })
            }
            else{
                res.status(401).json({
                    message: "session has expired. login required"
                })
            }   
        })
    }else{
        res.status(401).json({
            message: "access denied. login required"
        });
    }
}


module.exports = middleware;