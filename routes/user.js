const router = require('express').Router(),
      middleware = require('./../middleware/index'),
      crypto = require('crypto'),
      knex = require('../db/index');

router.get('/new',middleware.isAdmin,(req,res)=>{
    res.send('new user registration page');
})

router.post('/new',middleware.isAdmin,(req,res)=>{

    let id = req.body.id,
        name = req.body.name,
        email = req.body.email,
        phone = req.body.phone,
        role = req.body.role,
        salt = crypto.randomBytes(6).toString('hex'),
        password = crypto.pbkdf2Sync(req.body.password,salt,100,128,'sha512').toString('hex');

        knex('users')
            .insert({
                id: id, name: name, email: email, phone: phone, role: role, salt: salt, password: password
            }).then(rows=>{
                res.sendStatus(201);
            }).catch(error=>{
                res.sendStatus(401);
            })
})

router.get('/:id',middleware.isLoggedIn,(req,res)=>{
    knex('users')
        .havingNull('safe_delete')
        .where({
            id: req.params.id
        }).then(rows=>{
            res.send(rows);
        }).catch(error=>{
            console.log('no such record');
            res.sendStatus(401);
        });
});

router.get('/:id/edit',middleware.isLoggedIn,(req,res)=>{
    
    
    res.send("edit page");
});

router.put('/:id/edit',middleware.isLoggedIn,(req,res)=>{
    
    let oldPassword = req.body.oldPassword,
        newPassword = req.body.newPassword;
    knex('users')
        .where({id: req.params.id})
        .select('salt','password')
        .then(rows=>{
            if(rows.password == crypto.pbkdf2Sync(oldPassword,rows.salt,100,128,'sha512').toString('hex')){
                knex('users')
                    .where({ id: req.params.id})
                    .update({
                        password: crypto.pbkdf2Sync(newPassword,salt,100,128,'sha512').toString('hex')
                    }).then(rows=>{
                        res.statusCode(201)
                        res.send("updated");
                    }).catch(err=>{
                        res.statusCode(401);
                        res.redirect("back");
                    })
            }
            else{
                res.statusCode(403)
                res.redirect('back');
            }
        }).catch(error=>{
            console.log("error in password");
            res.redirect('/'); 
        })

});

router.delete('/:id/delete',middleware.isAdmin,(req,res)=>{
    
    knex('users')
        .update({safe_delete: knex.fn.now()})
        .where({id: req.params.id})
        .then(rows=>{
            res.statusCode(200)
            res.redirect('/');
        }).catch(err=>{
            res.statusCode(401);
            res.send("error")
        });
});

module.exports = router;