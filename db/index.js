const knex = require('knex')({
    client: 'mysql',
    connection:{
        host: 'localhost',
        user: 'general',
        password: '',
        database: 'project_dummy'
    },
    pool: {
        min: 0, max:7
    },
    fetchAsString: ['number','date'],
});


// knex('users').then(rows =>{
//     console.log(rows);
// })

// console.log(result);
// console.log("done!")

module.exports = knex;