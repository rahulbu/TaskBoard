const express = require('express'),
    bodyParser = require('body-parser'),
    helmet = require('helmet'),
    passport = require('passport'),
    localStrategy = require('passport-local'),
    expressSession = require('express-session'),
    expressSanitizer = require('express-sanitizer'),
    methodOverride = require('method-override'),
    knex = require('./db/index'),
    redisClient = require('./db/redis'),
    customFunctions = require('./middleware/customFunctions'),
    redisStore = require('connect-redis')(expressSession),
    app = express();
    
const Sentry = require('@sentry/node');

Sentry.init({ dsn: 'https://131fd8c483c846b4903c4df51ab7771d@sentry.io/2327658' });

app.use(helmet())

app.set("view engine","ejs")
// The request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler());

const tasksRoutes = require('./routes/tasks'),
        indexRoutes = require('./routes/index'),
        userRoutes = require('./routes/user'),
       teamRoutes = require('./routes/team');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
// app.use(express.static('./'))
app.use(expressSanitizer());
app.use(methodOverride("__method"));

app.use(expressSession({
    store: new redisStore({client: redisClient}) ,
    secret: "nothing here",
    resave: false,
    saveUninitialized: false,
}))

passport.use(new localStrategy(function(username,password,done){
    knex('users')
    .select('id','password','role','salt','name')
    .where({ id : username})
    .whereNull('safe_delete')
    .then(rows=>{
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
        done(null,rows[0]);
    }).catch(error=>{
        return done(error);
    })
})

app.use(passport.initialize());
app.use(passport.session());

app.use(function(req,res,next){
    res.locals.user =req.user;
    // res.locals.error = req.flash("error","");
    // res.locals.success = req.flash("success","");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    next();
})

app.use('/',indexRoutes);
app.use('/user',tasksRoutes);
app.use('/user',userRoutes);
app.use('/user',teamRoutes);


app.get('/loginFile',(req,res)=>{
    res.sendFile(__dirname+"/login.html")
})
app.get('/:id/userNew',(req,res)=>{
    res.sendFile(__dirname+"/newUser.html")
})

// app.use(Sentry.Handlers.errorHandler());

app.use(Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
      if (error.status === 404 || error.status === 500 || error.status === 401 || error.status === 400) {
        return true
      }
      return false
    }
  }));


app.get('*',(req,res)=>{
    res.redirect("/");
});


app.listen( process.env.PORT , process.env.IP,(error)=>{
    console.log(process.env.PORT);
    if (error)
        console.log("server not found.");
    else 
        console.log("server is running ...");
});