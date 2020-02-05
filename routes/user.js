const router = require('express').Router(),
      middleware = require('./../middleware/index'),
      customFunctions = require('./../middleware/customFunctions'),
      crypto = require('crypto'),
      knex = require('../db/index');


      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey('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');
    //   const msg = {
    //     to: 'rahulappu.das83@gmail.com',
    //     from: 'admin@TaskLine.com',
    //     subject: "new user invite mail",
    //     text: 'and easy to do anywhere, even with Node.js',
    //     html: '<b> login to your task line account using following credentials </b>',
    //   };
    //   sgMail.send(msg);



router.get('/:id/new',middleware.isAdmin,(req,res)=>{
    
    res.redirect("/"+req.params.id+"/userNew");
})

router.post('/:id/new',middleware.isAdmin,(req,res)=>{

    let id = req.body.id,
        name = req.body.name,
        email = req.body.email,
        phone = req.body.phone,
        role = req.body.role,
        salt = crypto.randomBytes(4).toString('hex'),
        pass = req.body.password,
        password = crypto.pbkdf2Sync(pass,salt,100,128,'sha512').toString('hex');

        knex('users')
            .insert({
                id: id, name: name, email: email, phone: phone, role: role, salt: salt, password: password
            }).then(rows=>{
            //     email = "devdummyrahul@gmail.com"
            //     customFunctions.sendMailService(email,{password: req.body.password, text: "new user", id:id})
            // .then(result=>{
            // console.log("mail sent");
            // res.redirect('back');
            sgMail.send({
                to: email,
                from: 'admin@TaskLine.com',
                subject: "new user invite mail",
                text: 'and easy to do anywhere, even with Node.js',
                html: '<b> login to your task line account using following credentials </b>'+'<i> user id:'+id+'<br>password:'+pass+'</i>'
            })
            res.sendStatus(201);

            }).catch(error=>{
                res.sendStatus(400);
                console.log("user error 1");
                console.log(error);
            })
})

router.get('/:id',middleware.isLoggedIn,(req,res)=>{
    knex('users')
        .whereNull('safe_delete')
        .select('id','name','phone','email','role')
        .where({
            id: req.params.id
        }).then(rows=>{
            res.status(200).json(rows);
        }).catch(error=>{
            console.log('no such record');
            console.log("user error 2");
            console.log(error);
            res.sendStatus(404);
        });
});

router.get('/:id/edit',middleware.isLoggedIn,(req,res)=>{
    

    knex('user')
    .select('id','name','phone','email')
    .where({
        id: req.params.id
    }).then(rows=>{
        res.status(200).json(rows);
    }).catch(error=>{
        console.log('no such record');
        console.log("user error 3");
        res.sendStatus(404);
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
                        res.sendStatus(204);
                    })
            }
            else{
                res.sendstatus(400);
            }
        }).catch(error=>{
            console.log("error in password");
            console.log("user error 5");
            res.sendStatus(400);
        })

});

router.delete('/:id/delete',middleware.isAdmin,(req,res)=>{
    
    knex('users')
        .update({safe_delete: knex.fn.now()})
        .whereNull('safe_delete')
        .where({id: req.params.id})
        .then(rows=>{
            res.sendStatus(204)
        }).catch(err=>{
            res.sendStatus(400);
            console.log("user error 6");
        });
});

module.exports = router;