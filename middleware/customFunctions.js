const crypto = require('crypto');
const { Worker } = require('worker_threads')


var customFunctions = {};

customFunctions.verifyPassword = (enteredPass, storedPass,salt)=>{
    
    if(!salt || !storedPass)
        return false;

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

// const sgMail = require('@sendgrid/mail');
// sgMail.setApiKey('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');
// const msg = {
//   to: 'rahulappu.das83@gmail.com',
//   from: 'admin@TaskLine.com',
//   subject: "new user invite mail",
//   text: 'and easy to do anywhere, even with Node.js',
//   html: '<b> login to your task line account using following credentials </b>',
// };
// sgMail.send(msg);


module.exports = customFunctions;