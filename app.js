const express = require('express'),
    bodyParser = require('body-parser'),
    helmet = require('helmet'),
    passport = require('passport'),
    localStrategy = require('passport-local'),
    expressSession = require('express-session'),
    expressSanitizer = require('express-sanitizer'),
    methodOverride = require('method-override'),
    knex = require('./db/index'),
    customFunctions = require('./middleware/customFunctions'),
    app = express();



app.use(helmet())

const tasksRoutes = require('./routes/tasks'),
        indexRoutes = require('./routes/index'),
        userRoutes = require('./routes/user'),
       teamRoutes = require('./routes/team');


app.use(bodyParser.urlencoded({extended:true}));
// app.use(express.static('./'))
app.use(expressSanitizer());
app.use(methodOverride("__method"));

app.use(expressSession({
    secret: "hola",
    resave: false,
    saveUninitialized: false,
}))

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy({
    usernameField : 'id',
    passwordField : 'password',
},function(username,password,done){
    knex('users')
    .select('id','password','role','salt')
    .where({ id : username})
    .whereNull('safe_delete')
    .then(rows=>{
        console.log(rows[0]);
        if(rows[0]){
            if(customFunctions.verifyPassword(password,rows[0].password,rows[0].salt))
                return done(null,rows[0]);
            else 
                return done(null,false,{message : "incorrect password"});
        }else 
            return done(null,false,{message: "incorrect user id"});

    }).catch(error=>{
        console.log("no rows");
        return done(error);
    })
}));
passport.serializeUser((user,done)=>{
    done(null,user);
})
passport.deserializeUser((user,done)=>{
    knex('users').where({id : user.id})
    .select('id','name','role')
    .whereNull('safe_delete')
    .then(rows=>{
        console.log("logging length")
        console.log(rows[0]);
        done(null,rows[0]);
    }).catch(error=>{
        return done(error);
    })
})


app.use(function(req,res,next){
    res.locals.user =req.user;
     console.log("2"+req.user);
    // res.locals.error = req.flash("error","");
    // res.locals.success = req.flash("success","");
    next();
})

app.use('/',indexRoutes);
app.use('/user',tasksRoutes);
app.use('/user',userRoutes);
app.use('/user',teamRoutes);


app.get('/',(req,res)=>{
    res.sendFile(__dirname+"/login.html")
})
app.get('/userNew',(req,res)=>{
    console.log(req.user);
    res.sendFile(__dirname+"/newUser.html")
})

app.get('*',(req,res)=>{
    res.redirect("/");
});

app.listen(process.env.PORT || 3000, process.env.IP || '127.0.0.1',(error)=>{
    if (error)
        console.log("server not found.");
    else 
    console.log("server is up and running ...");
});