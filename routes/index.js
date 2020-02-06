const router = require('express').Router(),
      passport = require('passport');
const redisClient = require('./../db/redis');
const jws = require('jws');


router.get('/login',(req,res)=>{
    res.redirect("/");
});

router.post('/login',passport.authenticate('local'),(req,res)=>{
    
    let payload = {
        id: req.user.id,
        name: req.user.name,
        role: req.user.role
    }
    const token = jws.sign({
        header: { alg: 'HS256'},
        payload: payload,
        secret: "secret key"
    })
    redisClient.setex(req.user.id,60*60,token,(err,rep)=>{
        if(err)
            console.log(err)
        else 
            console.log("pushed to redis");
    })
    res.status(200).json({
        id: req.user.id,
        token: token
    })
});

router.get('/user/:id/logout',(req,res)=>{
    req.logOut();
    redisClient.del(req.params.id,(err,reply)=>{
        console.log(reply)
    })
    console.log('logged out');
    res.status(200).json({
        message: "logout"
    })
});


module.exports = router;