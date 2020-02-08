const router = require('express').Router();
const knex = require('./../db/index');
var middleware = require('./../middleware/index');
const customFunctions = require('./../middleware/customFunctions');
const mailWorker = require('./../middleware/mailWorker');

const Sentry = require('@sentry/node');


router.get('/:id/tasks',middleware.isLoggedIn,(req,res)=>{      /** get all [to-do, in-progress, completed] tasks assigned to the user  */
    

    // let {sort,filter} = req.query;
    // let {offset,limit} = req.query;

    knex('tasks')
        .where({
            assignee: req.params.id
        })
        .whereNull('safe_delete')
        // .groupBy('priority')
        .orderBy('due_date')
        .select('id','name','priority','description','progress','progress_recorded_on','due_date','assignee','report_to')
        .then(rows=>{
            res.status(200).json(rows);
        })
        .catch(error=>{
            console.log("tasks error 1");
            Sentry.captureException(error)
            res.sendStatus(404);
        })
});

router.get('/:id/tasks/all',middleware.isLoggedIn,(req,res)=>{      /** get all tasks where the user is either assignee or report_to */
    knex('tasks')
        .where({
            assignee: req.params.id
        })
        .orWhere({
            report_to: req.params.id
        })
        .whereNull('safe_delete')
        .groupBy('priority')
        .orderBy('due_date')
        .select('id','name','priority','description','progress','progress_recorded_on','due_date','assignee','report_to')
        .then(rows=>{
            res.status(200).json(rows);
        })
        .catch(error=>{
            console.log("tasks error 2");
            Sentry.captureException(error)
            res.sendStatus(404)
        })
})

router.get('/:id/tasks/new',middleware.isLoggedIn,(req,res)=>{      /**  get the new task page */
    res.send("new task form");


});

router.post('/:id/tasks/new',middleware.isLoggedIn,(req,res)=>{     /** post new task */

    let name = req.body.name,
        priority = req.body.priority,
        description = req.body.description,
        progress = "to do",
        dueDate = req.body.dueDate,
        assignee = req.body.assignee,
        reportTo = req.params.id;
        progressRecordedOn = knex.fn.now();

        if(customFunctions.verifyCategory(priority,["high","low","normal"])){

        knex('tasks')
            .insert({
                name: name,
                priority: priority,
                description: description,
                progress: progress,
                due_date: dueDate,
                assignee: assignee,
                report_to: reportTo,
                progress_recorded_on: progressRecordedOn
            }).then(rows=>{
                res.sendStatus(201);
            })
            .then(()=>{
                knex('users')
                    .select('email')
                    .where({id: assignee})
                    .then(rows=>{
                        if(rows.length>0)
                            mailWorker.mailQueue.add({
                                userMailId: rows[0].email,
                                subject: "Task notification"
                            })
                    })
            }).catch(error=>{
                console.log("tasks error 3");
                console.log(error)
                Sentry.captureException(error)
                res.statusMessage="internal error"
                res.status(400).json({
                    message: "unable to create team."
                });
            })
        }else{
            res.statusMessage = "invalid input"
            res.status(400).json({
                message: "invalid priority option"
            })
        }
});

router.get('/:id/tasks/team/:teamId',middleware.isLoggedIn,(req,res)=>{   /** get tasks assigned to the team members */
    knex('team_members')
        .where({
            "team_members.team_id": req.params.teamId
        })
        .join('users',{'users.id':'team_members.user_id'})
        .join('tasks',{'team_members.user_id':'tasks.assignee'})
        .select('users.name','tasks.name','tasks.description','tasks.progress','tasks.due_date')
        .whereIn('report_to', knex.select('user_id').from('team_members').where({team_id: req.params.teamId}))
        .then(rows=>{
            res.status(200).json(rows);
        }).catch(error=>{
            console.log("tasks error 4");
            Sentry.captureException(error)
            res.sendStatus(404);
        })
});

router.get('/:id/tasks/:task_id',middleware.isLoggedIn,(req,res)=>{     /** get details of a particular task */
   
    knex('tasks')
        .where({
            id : req.params.task_id,
            assignee: req.params.id
        })
        .orWhere({id : req.params.task_id, report_to: req.params.id})
        .whereNull('safe_delete')
        .select('id','name','priority','description','progress','progress_recorded_on','due_date','assignee','report_to')
        .then(rows=>{
            res.status(200).json(rows);
        }).catch(error=>{
            console.log("tasks error 5");
            Sentry.captureException(error)
            res.sendStatus(404);
        });
});

router.get('/:id/tasks/:task_id/update',middleware.isLoggedIn,(req,res)=>{      /** get update task page */
    
    knex('tasks')
        .where({id: req.params.task_id})
        .whereNull('safe_delete')
        .select('name','priority','description','progress','progress_recorded_on','due_date','assignee','report_to')
        .then(rows=>{
            res.status(200).json(rows);
        }).catch(error=>{
            console.log("tasks error 6");
            Sentry.captureException(error)
            res.sendStatus(404);
        })
})

router.put('/:id/tasks/:task_id/update',middleware.isLoggedIn,(req,res)=>{      /** update[use put method] tasks */

    let progress = req.body.progress,
        oldProgress = req.body.oldProgress,
        progressRecordedOn = knex.fn.now();
    if(!customFunctions.checkProgress(progress,oldProgress)){
        res.statusMessage = "invalid progress update"
        res.status(400).json({
            message: "progress cannot be reverted"
        })
    }
    else{
        knex('tasks')
            .update({
                progress: progress,
                progress_recorded_on: progressRecordedOn
            })
            .where({id: req.params.task_id})
            .whereNull('safe_delete')
            .then(rows=>{
                res.sendStatus(204);
            }).catch(error=>{
                console.log("tasks error 7");
                Sentry.captureException(error)
                res.statusMessage = "cannot update. internal error"
                res.status(400).json({
                    message: "unable to update progress."
                });
            })
    }
});


module.exports = router;