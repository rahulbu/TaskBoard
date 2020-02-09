const router = require('express').Router(),
      passport = require('passport');
const redisClient = require('./../db/redis');
const jws = require('jws');
const knex = require('./../db/index');

const Sentry = require('@sentry/node');

router.get('/',(req,res)=>{
    knex('tasks')
        .select('name','description','due_date')
        .orderBy('due_date')
        .then(rows=>{
            res.json(rows)
        })
        .catch(err=>{
            Sentry.captureException(err);
            console.log(err)
            res.sendStatus(404);
        })
})

router.get('/login',(req,res)=>{
    // res.redirect("/loginFile");
    res.render("login")
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
        if(err){
            console.log(err)
            Sentry.captureException(err)
        }
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
    let message = "logout"
    redisClient.del(req.params.id,(err,reply)=>{
        if(err)
            message="couldn't end the session"
        console.log(reply)
    })
    console.log('logged out');
    res.status(200).json({
        message: message
    })
});


module.exports = router;