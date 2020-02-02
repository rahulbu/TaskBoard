var middleware = {};

middleware.isLoggedIn = function(req,res,next){
    console.log('checking logged in');
    // console.log(req);
    if(req.isAuthenticated())
        return next();
    else {
        res.redirect("/");
    }
}

middleware.isAdmin = (req,res,next)=>{
    console.log('checking for admin');
    if(req.isAuthenticated()){
        if(req.user.role == "admin"){
            return next();
        }else{
            res.sendStatus(401);
        }
    }else res.redirect('/');
}


module.exports = middleware;