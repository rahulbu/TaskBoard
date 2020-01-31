const router = require('express').Router(),
      knex = require('../db/index');


router.get('/login',(req,res)=>{
    res.send("login page");
});

router.post('/login',(req,res)=>{

});

router.get('/logout',(req,res)=>{
    res.send("logout page");
});



module.exports = router;