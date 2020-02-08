const router = require('express').Router(),
      middleware = require('./../middleware/index'),
      customFunctions = require('./../middleware/customFunctions'),
      mailWorker = require('./../middleware/mailWorker'),
      crypto = require('crypto'),
      knex = require('../db/index');


      const Sentry = require('@sentry/node');

router.get('/:id/new',middleware.isAdmin,(req,res)=>{   /** get new user form */
   
    res.redirect("/"+req.params.id+"/userNew");
})

router.post('/:id/new',middleware.isAdmin,(req,res)=>{      /** post-method new user  */

    let email = req.body.email;
    
     mailWorker.verifier.verify(email,(err,data)=>{
        if(err){
            Sentry.captureException(err)
            console.log(err)
            res.status(400).json({
                message: "unable to verify email address. Try again"
            })
        }
        else if(data.formatCheck && data.smtpCheck && data.dnsCheck){
            console.log("valid");


        if(!(customFunctions.verifyLength(id,5) && customFunctions.verifyCategory(role,['admin','user']) && customFunctions.verifyLength(phone,10))){
            res.statusMessage = "invalid input entries"
            res.status(400).json({
                message: "enter proper input."
            })
        }
        else{
            let id = req.body.id,
            name = req.body.name,
            phone = req.body.phone,
            designation = req.body.designation,
            role = req.body.role,
            salt = crypto.randomBytes(4).toString('hex'),
            pass = crypto.randomBytes(4).toString('hex'),
            password = crypto.pbkdf2Sync(pass,salt,100,128,'sha512').toString('hex');

            

            knex('users')
                .insert({
                    id: id, name: name, email: email, phone: phone, role: role, salt: salt, password: password,designation:designation
                }).then(rows=>{
                mailWorker.mailQueue.add({
                    userMailId: email,
                    subject: "user invitation",
                    username: id,
                    password: pass
                });

                res.status(201).json({
                    message: "invite mail sent"
                });

                }).catch(error=>{
                    
                    Sentry.captureException(error)

                    // console.log("user error 1");
                    console.log(error);
                    res.statusMessage="cannot insert. internal error"
                    res.status(400).json({
                        message: "couldn't create user. duplicate user id or invalid credentials."
                    })
                })

            }
        }else{
            res.status(400).json({
                message: "invalid email address"
            })
        }
    })
})

router.get('/:id',middleware.isLoggedIn,(req,res)=>{        /** get user details/profile */
    knex('users')
        .whereNull('safe_delete')
        .select('id','name','phone','email','role','designation')
        .where({
            id: req.params.id
        }).then(rows=>{
            res.status(200).json(rows);
        }).catch(error=>{
            console.log('no such record');
            console.log("user error 2");
            // console.log(error);
            Sentry.captureException(error);
            res.statusMessage = "user not found"
            res.status(404).json({
                message: "page not found"
            });
        });
});

router.get('/:id/edit',middleware.isLoggedIn,(req,res)=>{       /** get page for editing user details, use the sent details to display as values in the form */
    

    knex('user')
    .select('name','phone','email','designation')
    .whereNull('safe_delete')
    .where({
        id: req.params.id
    }).then(rows=>{
        res.status(200).json(rows);
    }).catch(error=>{
        console.log('no such record');
        console.log("user error 3");
        Sentry.captureException(error)
        res.sendStatus(404);
    });
});

router.put('/:id/edit',middleware.isLoggedIn,(req,res)=>{       /** update[use put method] user details - name,phone,email,designation */

    let id = req.params.id,
        { name,phone,email,designation} = req.body;

        knew('users')
            .where({id: id})
            .whereNull('safe_delete')
            .update({
                name: name, phone: phone, email: email, designation: designation
            })
            .then(rows=>{
                res.sendStatus(204)
            })
            .catch(err=>{
                Sentry.captureException(err)
                res.statusMessage = "unable to update"
                res.sendStatus(400)
            })
})

router.put('/:id/changePassword',middleware.isLoggedIn,(req,res)=>{     /** update [use put method]  */
    
    let oldPassword = req.body.oldPassword,
        newPassword = req.body.newPassword;
        
    knex('users')
        .where({id: req.params.id})
        .whereNull('safe_delete')
        .select('salt','password')
        .then(rows=>{
            if(rows[0].password == crypto.pbkdf2Sync(oldPassword,rows.salt,100,128,'sha512').toString('hex')){
                knex('users')
                    .where({ id: req.params.id})
                    .update({
                        password: crypto.pbkdf2Sync(newPassword,salt,100,128,'sha512').toString('hex')
                    }).then(rows=>{
                        res.sendStatus(204);
                    })
            }
            else{
                res.statusMessage = "password mismatch"
                res.sendstatus(400);
            }
        }).catch(error=>{
            console.log("error in password");
            console.log("user error 5");
            Sentry.captureException(error)
            res.statusMessage="unable to update password."
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
            Sentry.captureException(err)
            res.sendStatus(400);
            console.log("user error 6");
        });
});

module.exports = router;