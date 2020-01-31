var middleware = {};

middleware.isLoggedIn = (req,res,next)=>{
    console.log('checking logged in');
    next();
}

middleware.isAdmin = (req,res,next)=>{
    console.log('checking for admin');
    next();
}


module.exports = middleware;