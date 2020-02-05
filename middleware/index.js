var middleware = {};

middleware.isLoggedIn = function(req,res,next){
    console.log('checking logged in');
    // console.log(req.user);
    if(req.isAuthenticated() && req.params.id==req.user.id)
        return next();
    else {
        res.sendStatus(401);
    }
}

middleware.isAdmin = (req,res,next)=>{
    console.log('checking for admin');
    if(req.isAuthenticated() && req.params.id==req.user.id && req.user.role=="admin"){
        return next();
    }else{
        res.sendStatus(401);
    }
}


module.exports = middleware;