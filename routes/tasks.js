const router = require('express').Router();
const knex = require('./../db/index');
var middleware = require('./../middleware/index');

router.get('/:id/tasks',middleware.isLoggedIn,(req,res)=>{
    
    knex('tasks')
        .where({
            assignee: req.params.id
        })
        .then(rows=>{
            res.status(200).json(rows);
        })
        .catch(error=>{
            console.log("tasks error 1");
            res.sendStatus(404);
            // res.redirect("back");
        })
});

router.get('/:id/all',middleware.isLoggedIn,(req,res)=>{
    knex('tasks')
        .where({
            assignee: req.params.id
        })
        .orWhere({
            report_to: req.params.id
        })
        .then(rows=>{
            res.status(200).json(rows);
        })
        .catch(error=>{
            console.log("tasks error 2");
            res.sendStatus(404)
        })
})

router.get('/:id/tasks/new',middleware.isLoggedIn,(req,res)=>{
    res.send("new task form");
});

router.post('/:id/tasks/new',middleware.isLoggedIn,(req,res)=>{

    let name = req.body.name,
        priority = req.body.priority,
        description = req.body.description,
        progress = "to do",
        dueDate = req.body.dueDate,
        assignee = req.body.assignee,
        reportTo = req.params.id;
        // progressRecordedOn = knex.fn.now();
        knex('tasks')
            .insert({
                name: name,
                priority: priority,
                description: description,
                progress: progress,
                due_date: dueDate,
                assignee: assignee,
                report_to: reportTo
                // progress_recorded_on: progressRecordedOn
            }).then(res=>{
                res.sendStatus(201);
                // res.redirect("/user/"+req.params.id+"/tasks");
            }).catch(error=>{
                console.log("tasks error 3");
                res.sendStatus(400);
            })
});

router.get('/:id/tasks/team/:teamId',middleware.isLoggedIn,(req,res)=>{   ////////////////query not proper
    knex('team_members')
        .where({
            "team_members.team_id": req.params.teamId
        })
        .join('users',{'users.id':'team_members.user_id'})
        .join('tasks',{'team_members.user_id':'tasks.assignee'})
        .select('users.name','tasks.name','tasks.description','tasks.progress')
        .whereIn('report_to', knex.select('user_id').from('team_members').where({team_id: req.params.teamId}))
        .then(rows=>{
            res.status(200).json(rows);
        }).catch(error=>{
            console.log("tasks error 4");
            res.sendStatus(404);
        })
});

router.get('/:id/tasks/:task_id',middleware.isLoggedIn,(req,res)=>{
   
    knex('tasks')
        .where({
            id : req.params.task_id,
            assignee: req.params.id
        })
        .orWhere({id : req.params.task_id, report_to: req.params.id})
        .then(rows=>{
            res.status(200).json(rows);
        }).catch(error=>{
            console.log("tasks error 5");
            res.sendStatus(401);
            // res.redirect("back");
        });
});

router.get('/:id/tasks/:task_id/update',middleware.isLoggedIn,(req,res)=>{
    
    knex('tasks')
        .where({id: req.params.task_id})
        .then(rows=>{
            res.status(200).json(rows);
        }).catch(error=>{
            console.log("tasks error 6");
            res.sendStatus(404);
            // res.redirect("back");
        })
})

router.put('/:id/tasks/:task_id/update',middleware.isLoggedIn,(req,res)=>{

    let progress = req.body.progress,
        progressRecordedOn = knex.fn.now();

    knex('tasks')
        .update({
            progress: progress,
            progress_recorded_on: progressRecordedOn
        })
        .where({id: req.params.task_id})
        .then(rows=>{
            res.sendStatus(204);
        }).catch(error=>{
            console.log("tasks error 7");
            res.sendStatus(400);
        })
});


module.exports = router;