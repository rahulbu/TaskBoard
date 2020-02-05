const router = require('express').Router(),
      passport = require('passport'),
      middleware = require('./../middleware/index');


router.get('/login',(req,res)=>{
    res.redirect("/");
});

router.post('/login',passport.authenticate('local'),(req,res)=>{
    console.log("user id : "+req.user.id);
    res.redirect("/user/"+req.user.id);
    // res.sendStatus(200);
});

router.get('/logout',(req,res)=>{
    req.logOut();
    console.log('logged out');
    res.redirect('/');
});



module.exports = router;