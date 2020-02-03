const crypto = require('crypto');
const { Worker } = require('worker_threads')


var customFunctions = {};

customFunctions.verifyPassword = (enteredPass, storedPass,salt)=>{
    
    const password = crypto.pbkdf2Sync(enteredPass,salt,100,128,'sha512').toString('hex');

    if( storedPass==password)
        return true;
    return false;
}

function runService(workerData) {
    return new Promise((resolve, reject) => {
        const worker = new Worker(__dirname+"/mailWorker.js", { workerData });
        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', (code) => {
        if (code !== 0)
            reject(new Error(`Worker stopped with exit code ${code}`));
        })
    });
}

customFunctions.sendMailService = async function(userMail,message) {
    const result = await runService({ userEmail : userMail, message: message});
    console.log(result);
}



module.exports = customFunctions;