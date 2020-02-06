
    // local setup 
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
        min: 1, max:10
    },
    fetchAsString: ['number','date'],
});

/* */

    /// production 

const knex = require('knex')({
    client: 'pg',
    connection: process.env.DATABASE_URL,
    ssl:true,
    pool: { min: 1, max: 10 }
});
/**/

module.exports = knex;