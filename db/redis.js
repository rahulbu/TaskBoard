const redis =  require('redis');

// const redisClient = redis.createClient();

const redisClient = redis.createClient(process.env.REDIS_URL);    // production

redisClient.on("connect",(err)=>{
    if(err)
        console.log("redis is down");
    else
        console.log("redis is running ... ");
})

module.exports = redisClient;