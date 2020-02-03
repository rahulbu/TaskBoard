const router = require('express').Router(),
      middleware = require('./../middleware/index'),
      customFunctions = require('./../middleware/customFunctions'),
      crypto = require('crypto'),
      knex = require('../db/index');

router.get('/new',middleware.isAdmin,(req,res)=>{

    res.redirect("/userNew");
})

router.post('/new',middleware.isAdmin,(req,res)=>{

    let id = req.body.id,
        name = req.body.name,
        email = req.body.email,
        phone = req.body.phone,
        role = req.body.role,
        salt = crypto.randomBytes(4).toString('hex'),
        password = crypto.pbkdf2Sync(req.body.password,salt,100,128,'sha512').toString('hex');

        knex('users')
            .insert({
                id: id, name: name, email: email, phone: phone, role: role, salt: salt, password: password
            }).then(rows=>{
                email = "devdummyrahul@gmail.com"
                customFunctions.sendMailService(email,{password: req.body.password, text: "new user", id:id})
                    .then(result=>{
                        // res.statusCode(200);
                        // res.redirect("back");
                    // res.sendStatus(201);
                    console.log("mail sent");
                    res.redirect('back');
                    }).catch(err=>{
                        // res.statusCode(400);
                        console.log("couldn't send mail");
                        console.log(err);
                        res.redirect('back');
                    })
                console.log("added user")
            }).catch(error=>{
                res.sendStatus(400);
                console.log("user error 1");
                console.log(error);
            })
})

router.get('/:id',middleware.isLoggedIn,(req,res)=>{
    knex('users')
        // .whereNull('safe_delete')
        .select('id','name','phone','email','role')
        .where({
            id: req.params.id
        }).then(rows=>{
            res.send(rows);
        }).catch(error=>{
            console.log('no such record');
            console.log("user error 2");
            res.sendStatus(400);
        });
});

router.get('/:id/edit',middleware.isLoggedIn,(req,res)=>{
    
    /// edit parameters


    knex('user')
    .select('id','name','phone','email')
    .where({
        id: req.params.id
    }).then(rows=>{
        res.send(rows);
    }).catch(error=>{
        console.log('no such record');
        console.log("user error 3");
        res.sendStatus(400);
    });

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
                        console.log("user error 4");
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
            console.log("user error 5");
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
            console.log("user error 6");
            res.send("error")
        });
});

module.exports = router;