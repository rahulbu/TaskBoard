const router = require('express').Router(),
      middleware = require('./../middleware/index'),
      knex = require('../db/index');

router.get('/new',middleware.isAdmin,(req,res)=>{
    res.send('new user registration page');
})

router.post('/new',middleware.isAdmin, (req,res)=>{
    res.status(201);
    res.send("new user created.")
})

router.get('/:id',middleware.isLoggedIn,(req,res)=>{
    knex('users')
        .havingNull('safe_delete')
        .where({
            id: req.params.id
        }).then(rows=>{
            res.json(rows);
        });
});

router.get('/:id/edit',middleware.isLoggedIn,(req,res)=>{
    
    res.send("edit page");
});

router.post('/:id/edit',middleware.isLoggedIn,(req,res)=>{
    res.send("edit processing");
});

router.delete('/:id/delete',middleware.isLoggedIn,(req,res)=>{
    res.send("deletion");
});

module.exports = router;