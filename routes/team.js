const knex = require('./../db/index');
const router= require('express').Router();


router.get('/:id/team/new',(req,res)=>{
    res.send("new team creation page");
});

router.post('/:id/team/new',(req,res)=>{
    res.status(201);
    res.send("creation of new team");
});

router.get('/:id/team/:team_id',(req,res)=>{
    knex('team_members')
        .join('users',{'users.id':'team_members.user_id'})
        .join('team',{'team.id':'team_members.team_id'})
        .select('users.Name','team.name')
        // .havingNull('safe_delete')
        .where({
            'team_members.team_id' : req.params.team_id
        }).then(rows=>{
            res.json(rows);
        })
});

router.post('/:id/team/:team_id/delete',(req,res)=>{
    res.send("deletion in process");
});

module.exports = router;
