
const config = require('./../.config.js');

const Verifier = require("email-verifier");

const sgMail = require('@sendgrid/mail');
      
sgMail.setApiKey(process.env.MAIL_API/* config.Mail_API_key */ );

var Queue = require('bull');

// const mailQueue = new Queue('mail_queue','redis://127.0.0.1:6379');

const mailQueue = new Queue('mail_queue',process.env.REDIS_URL);    ////PRODUCTION

mailQueue.on('completed',(job,result)=>{
     console.log('mail sent')
})

mailQueue.process(async (job)=>{
       await sendMail(job.data);
 })


sendMail = (data)=>{
  console.log(data.userMailId)
    let html;
    if(data.subject == "user invitation"){
      html = "<h1>Welcome,<h1><br><h3>Log in to your task-line account using following credentials</h3><br><a href='http://task-line.herokuapp.com/login'>website link</a><br><strong>username : "+data.username+"<br>password : "+data.password+"</strong><br><br><h3>Regards<br>Team TaskLine</h3>";
    }
    else if(data.subject == "Task notification"){
      html = "<h2>You have been assigned a task.<br>Priority :<strong>"+data.priority+"</strong><br><br><h3>Regards,<br>Team TaskLine</h3>"
    }
    else{
      html="<h2> You have been added to a new team. Login to your account for more details.</h2><br><br><h3>Regards,<br>Team TaskLine</h3>"
    }
    const msg = {
        to: data.userMailId,
        from: 'admin@TaskLine.com',
        subject: data.subject,
        text: 'log into your TaskLine account for further details.',
        html: html,
    };
    sgMail.send(msg)
}



const verifier = new Verifier( process.env.EMAIL_VERIFIER/* config.Email_verifier_key*/ ,{
    checkCatchAll: false,
    checkDisposable: false,
    checkFree: false,
    validateDNS: true,
    validateSMTP: true
});

module.exports = {
  verifier,
  mailQueue
}