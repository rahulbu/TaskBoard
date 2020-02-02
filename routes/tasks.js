const router = require('express').Router();
const knex = require('./../db/index');
// const passport = require('passport');
// var middleware = require('./../middleware/index');

router.get('/:id/tasks',(req,res)=>{
    console.log(req.user);
    knex('tasks')
        .where({
            assignee: req.params.id
        }).then(rows=>{
            console.log(rows);
            res.json(rows);
        }).catch(error=>{
            console.log("error");
            res.statusCode(400);
            res.redirect("back");
        })
});

router.get('/:id/tasks/new',(req,res)=>{
    res.send("new task form");
});

router.post('/:id/tasks/new',(req,res)=>{

    let name = req.body.name,
        priority = req.body.priority,
        description = req.body.description,
        progress = req.body.progress,
        dueDate = req.body.dueDate,
        assignee = req.body.assignee,
        reportTo = req.params.id;
        progressRecordedOn = knex.fn.now();
        knex('tasks')
            .insert({
                name: name,
                priority: priority,
                description: description,
                progress: progress,
                due_date: dueDate,
                assignee: assignee,
                report_to: reportTo,
                progress_recorded_on: progress_recorded_on
            }).then(res=>{
                console.log(res);
                res.statusCode(201);
                res.redirect("/user/"+req.params.id+"/tasks");
            }).catch(error=>{
                res.statusCode(400);
                res.redirect("back");
            })
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
        }).catch(error=>{
            res.statusCode(401);
            
        });
});

router.get('/:id/tasks/:task_id/update',(req,res)=>{
    // res.send("update or edit task")
    knex('tasks')
        .where({id: req.params.task_id})
        .then(rows=>{
            res.json(rows);
        }).catch(error=>{
            // res.statusCode(401);
            res.sendStatus(401);
        })
})

router.put('/:id/tasks/:task_id/update',(req,res)=>{
    // res.send("posting");

    let progress = req.body.progress,
        progressRecordedOn = knex.fn.now();

    knex('tasks')
        .update({
            progress: progress,
            progress_recorded_on: progressRecordedOn
        })
        .where({id: req.params.task_id})
        .then(rows=>{
            res.sendStatus(202)

        }).catch(error=>{
            // res.statusCode(401);
            res.sendStatus(401);
        })
});


module.exports = router;