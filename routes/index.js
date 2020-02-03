const router = require('express').Router(),
      passport = require('passport'),
      middleware = require('./../middleware/index');


router.get('/login',(req,res)=>{
    res.redirect("/");
});

router.post('/login',passport.authenticate('local',{
    failureRedirect: "/login"
}),(req,res)=>{
    console.log("user id : "+req.user.id);
    res.redirect("/user/"+req.user.id);
});

router.get('/logout',middleware.isLoggedIn,(req,res)=>{
    req.logOut();
    console.log('logged out');
    res.redirect('/');
});



module.exports = router;