const knex = require('./../db/index');
const router= require('express').Router();
const middleware = require('./../middleware/index');
const customFunctions = require('./../middleware/customFunctions');

const Sentry = require('@sentry/node');


router.get('/:id/team/new',middleware.isAdmin,(req,res)=>{     /* get new team form  */
    // res.send("new team creation page");
    
    
    
    knex('users')
        .select('id','name')
        .whereNull('safe_delete')
        .orderBy('name')
        .then(rows=>{
            res.status(200).json(rows);
        }).catch(err=>{
            console.log("team error 0");
            Sentry.captureException(err);
            res.status(404).jsone({
                message: "data not found."
            });
        })
});

router.get('/:id/team/addmember',middleware.isAdmin,(req,res)=>{    /** get add new member to existing team */

    let teamobj;
    
    knex('users')
        .select('id','name')
        .whereNull('safe_delete')
        .orderBy('name')
        .then(rows=>{
            // res.status(200).json(rows);
            teamobj = rows;
            knex('team')
                .select('id','name')
                .whereNull('safe_delete')
                .orderBy('name')
                .then(rows=>{
                    res.json({
                        teamobj,
                        rows
                    })
                })
                .catch(err=>{
                    Sentry.captureException(err)
                    console.log(err)
                    res.sendStatus(400)
                })
        }).catch(err=>{
            console.log("team error 0");
            Sentry.captureException(err);
            res.status(404).json({
                message: "data not found."
            });
        })
})

router.post('/:id/team/addmember',middleware.isAdmin,(req,res)=>{       /** post(add) new user member to any existing team */
    let {teamId,userId} = req.body;

    knex('team_members')
        .insert({
            team_id: teamId,
            user_id: userId
        })
        .then(rows=>{
            res.statusMessage = "team member added"
            res.status(201).json({
                message: "member added"
            })
        })
        .catch(err=>{
            Sentry.captureException(err)
            res.status(400).json({
                message: "unable to add user to the team"
            })
        })
})

router.post('/:id/team/new',middleware.isAdmin,(req,res)=>{             /* post new team */

    let name= req.body.name,
        description = req.sanitize(req.body.description),
        created_on = knex.fn.now();

    

    knex('team')
        .insert({
            name: name,
            description: description,
            created_on: created_on
        })
        // .returning('id')
        .then(row_id=>{
            
            let fieldsToInsert = req.body.users.map(field => 
                ({ user_id: field, team_id: row_id })); 

            knex('team_members')
                .insert(fieldsToInsert)
                .then(rows=>{
                    res.sendStatus(201);
                })
        }).catch(error=>{
            console.log("team error 2");
            Sentry.captureException(error);
            res.statusMessage = "can not create team. internal error"
            res.status(400).json({
                message: "ERROR! cannot create team."
            });
        })
});

router.get('/:id/team/all',middleware.isLoggedIn,(req,res)=>{                   /** get all teams of the user */
    knex('team_members')
        .join('team',{'team_members.team_id':'team.id'})
        .select('team.name','team.id','team.description')
        .orderBy('team.name')
        .where({
            'team_members.user_id': req.params.id
        })
        .whereNull('team_members.safe_delete')
        .then(rows=>{
            res.status(200).json(rows)
        })
        .catch(err=>{
            console.log(err);
            Sentry.captureException(err);
            res.statusMessage = "teams not found. internal error"
            res.status(404).json({
                message: "data not found. contact admin"
            });
        })
})

router.get('/:id/team/:team_id',middleware.isLoggedIn,(req,res)=>{      /** get specific team details */
    knex('team_members')
        .join('users',{'users.id':'team_members.user_id'})
        .join('team',{'team.id':'team_members.team_id'})
        .select('users.id','users.name','team.name','team.description')
        .whereNull('team_members.safe_delete')
        .where({
            'team_members.team_id' : req.params.team_id
        }).then(rows=>{
            res.status(200).json(rows);
        }).catch(err=>{
            console.log("team error 3");
            Sentry.captureException(err);
            console.log(err)
            res.statusMessage = "team not found. internal error"
            res.status(404).json({
                message: "data not found. contact admin"
            });
        })
});

router.delete('/:id/team/:team_id/delete',middleware.isAdmin,(req,res)=>{   /** delete[update safe_delete] team  */
    
    let {teamId} = req.params;

    knex('team')
        .update({ safe_delete: knex.fn.now()})
        .where({ id: teamId})
        .whereNull("safe_delete")
        .then(rows=>{
            res.sendStatus(204);
        }).catch(error=>{
            console.log("team error 4");
            Sentry.captureException(error);
            res.statusMessage = "team not found. internal error"
            res.status(400).json({
                message: "data not found. contact admin"
            });
        })
});

module.exports = router;
