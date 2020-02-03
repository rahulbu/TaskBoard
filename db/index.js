//////////////////////////////////////
/* 
const config = require('./../.config')


const knex = require('knex')({
    client: 'mysql',
    connection:{
        host: config.Database_host,
        user: config.Database_user,
        password: config.Database_password,
        database: config.Database_database
    },
    pool: {
        min: 0, max:7
    },
    fetchAsString: ['number','date'],
});
*////////////////////////////

const knex = require('knex')({
    client: 'pg',
    connectionString: process.env.DATABASE_URL,
    ssl:true,
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