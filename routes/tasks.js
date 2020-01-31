const router = require('express').Router();
const knex = require('./../db/index');

router.get('/:id/tasks',(req,res)=>{
    knex('tasks')
        .where({
            assignee: req.params.id
        }).then(rows=>{
            res.json(rows)
        }).catch(error=>{
            console.log("error");
        })
});

router.get('/:id/tasks/new',(req,res)=>{
    res.send("new task form");
});

router.post('/:id/tasks/new',(req,res)=>{
    res.send("posting new task .");
});

router.get('/:id/tasks/team/:teamId',(req,res)=>{
    knex('team_members')
        .join('tasks',{'team_members.user_id':'tasks.assignee'})
        .join('users',{'users.id':'team_members.user_id'})
        .select('users.Name','tasks.name','tasks.description','tasks.progress')
        .where({
            team_id: req.params.teamId
        }).then(rows=>{
            res.json(rows);
        })
});

router.get('/:id/tasks/:task_id',(req,res)=>{
    // console.log(req.params.task_id);
    knex('tasks')
        .where({
            id : req.params.task_id
        }).then(rows=>{
            res.json(rows);
        });
});

router.get('/:id/tasks/:task_id/update',(req,res)=>{
    res.send("update or edit task")
})

router.post('/:id/tasks/:task_id/update',(req,res)=>{
    res.send("posting");
});


module.exports = router;