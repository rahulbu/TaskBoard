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
    cors = require('cors'),
    app = express();



app.use(helmet())
app.use(cors())
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
    secret: "hola",
    resave: false,
    saveUninitialized: false,
}))

passport.use(new localStrategy(function(username,password,done){
    knex('users')
    .select('id','password','role','salt')
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
    // res.header("Access-Control-Allow-Origin", "*");
    // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    // res.header("Access-Control-Allow-Credentials","true")

    // res.header('Access-Control-Allow-Origin', 'http://localhost:8000/');
    // res.header('Access-Control-Allow-Credentials', true);
    // res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    

    next();
})

app.use('/',indexRoutes);
app.use('/user',tasksRoutes);
app.use('/user',userRoutes);
app.use('/user',teamRoutes);


app.get('/',(req,res)=>{
    res.sendFile(__dirname+"/login.html")
})
app.get('/:id/userNew',(req,res)=>{
    res.sendFile(__dirname+"/newUser.html")
})

app.get('*',(req,res)=>{
    res.redirect("/");
});

app.listen(process.env.PORT, process.env.IP,(error)=>{
    console.log(process.env.PORT);
    if (error)
        console.log("server not found.");
    else 
        console.log("server is running ...");
});