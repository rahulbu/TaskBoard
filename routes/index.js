const router = require('express').Router(),
      passport = require('passport'),
      knex = require('../db/index');


router.get('/login',(req,res)=>{
    // res.sendFile(__dirname+"/../login.html");
    res.redirect("/");
    // res.sendStatus(404);
});

router.post('/login',passport.authenticate('local',{
    failureRedirect: "/login"
}),(req,res)=>{
    console.log(req.user);
    // const userId = req.body.userId;
    // const password = req.body.password;
    // const role = req.body.role;
    // res.redirect("/user/"+req.user.id);
    console.log("user id : "+req.user.id);
    res.redirect("/user/"+req.user.id);
});

// router.post("/login",passport.authenticate("local",
// {
//     // successRedirect : "/projects",
//     // failureFlash: 'Invalid username or password.',
//     // failureRedirect : "/login"
    
// }), function(req,res){
//     console.log(req.user)
//     // req.flash("success","Logged In !!")
//     // if(req.user.type == 'student')
//     //     res.redirect("/student/"+req.body.usn)
//     // else res.redirect("/teacher/"+req.body.usn)
//     res.redirect('/user'+req.body.userId);
// });


router.get('/logout',(req,res)=>{
    req.logOut();
    res.redirect('/');
    // res.send("logout page");
});



module.exports = router;