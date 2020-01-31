const app = require('express')();

const tasksRoutes = require('./routes/tasks'),
        indexRoutes = require('./routes/index'),
        userRoutes = require('./routes/user'),
       teamRoutes = require('./routes/team');


app.use('/',indexRoutes);
app.use('/user',tasksRoutes);
app.use('/user',userRoutes);
app.use('/user',teamRoutes);

app.get('*',(req,res)=>{
    res.send("try using correct paths");
});

app.listen(3000, 'localhost',(error)=>{
    if (error)
        console.log("server not found.");
    else 
    console.log("server is up and running ...");
});