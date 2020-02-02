const knex = require('./../db/index');

knex.schema.createTable('users',(table)=>{
    table.string('id',5).primary();
    table.string('name',40);
    table.string('email',50);
    table.string('phone',10);
    table.string('password',256);
    table.string('salt',16);
    table.enum('role',['admin','user']);
    // table.dateTime('safe_delete',{precision:3}).defaultTo(null);
}).then((result)=>{
    console.log("table created");
}).catch(err=>{
    console.log("error creating table");
});

knex.schema.createTable('tasks',(table)=>{
    table.bigIncrements('id').primary();
    table.string('name',30);
    table.enum('priority',['high','normal','low']);
    table.string('description',100);
    table.enum('progress',['to do','in progress','completed']).defaultTo('to do');
    table.timestamp('progress_recorder_on',{precision:3});
    table.string('assignee',5);
    table.string('report_to',5);
    table.dateTime('safe_delete',{precision:3}).defaultTo(null);
    table.foreign('report_to').references('users.id');
    table.foreign('assignee').references('users.id');
});

knex.schema.createTable('team',(table)=>{
    table.increments('id').primary();
    table.string('name',50);
    table.string('description',100);
    table.timestamp('created_on',{precision:3}).defaultTo(knex.fn.now());
    table.dateTime('safe_delete',{precision: 3});

});

knex.schema.createTable('team_members',table=>{
    table.string('user_id',5);
    table.bigInteger('team_id');
    table.dateTime('safe_delete').defaultTo(null);
    table.primary(['user_id','team_id']);
    table.foreign('user_id').references('users.id');
    table.foreign('team_id').references('team.id')
});