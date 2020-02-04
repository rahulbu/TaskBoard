const knex = require('./../db/index');
const router= require('express').Router();
const middleware = require('./../middleware/index');


router.get('/:id/team/new',middleware.isAdmin,(req,res)=>{
    res.send("new team creation page");
    knex('users')
        .select('id','name')
        .then(rows=>{
            res.json(rows);
        }).catch(err=>{
            console.log("team error 0");
            res.sendStatus(400);
        })
});

router.post('/:id/team/new',middleware.isAdmin,(req,res)=>{

    let name= req.body.name,
        description = req.sanitize(req.body.description),
        created_on = knex.fn.now();

    knex('team')
        .insert({
            name: name,
            description: description,
            created_on: created_on
        })
        .returning('id')
        .then(row_id=>{
            
            let fieldsToInsert = req.body.users.map(field => 
                ({ user_id: field, team_id: row_id })); 

            knex('team_members')
                .insert(fieldsToInsert)
                .then(rows=>{
                    res.sendStatus(201);
                })
                // .catch(error=>{
                //     console.log("team error 1");
                //     res.sendStatus(401);
                // })
        }).catch(error=>{
            console.log("team error 2");
            res.sendStatus(401);
        })

    res.status(201);
    res.send("creation of new team");
});

router.get('/:id/team/:team_id',middleware.isLoggedIn,(req,res)=>{
    knex('team_members')
        .join('users',{'users.id':'team_members.user_id'})
        .join('team',{'team.id':'team_members.team_id'})
        .select('users.name','team.name')
        // .whereNull('team_members.safe_delete')
        .where({
            'team_members.team_id' : req.params.team_id
        }).then(rows=>{
            res.json(rows);
        }).catch(err=>{
            console.log("team error 3");
            res.sendStatus(400);
        })
});

router.delete('/:id/team/:team_id/delete',middleware.isAdmin,(req,res)=>{
    knex('tasks')
        .update({ safe_delete: knex.fn.now()})
        .where({ id: req.params.team_id})
        .then(rows=>{
            res.statusCode(200);
            res.send("deletion in process");
        }).catch(error=>{
            console.log("team error 4");
            res.sendStatus(401);
        })
});

module.exports = router;
