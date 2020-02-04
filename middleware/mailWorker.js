const { workerData, parentPort} = require('worker_threads');
const nodeMailer = require('nodemailer');
const config = require('./../.config.js');

console.log("web worker in progress");
// console.log(workerData);

async function main() {

    let transporter = nodeMailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: config.Mail_address || process.env.MAIL_ADDRESS, // generated ethereal user
        pass: config.Mail_password || process.env.MAIL_PASSWORD // generated ethereal password
      }
    });
  
    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: config.Mail_address || process.env.MAIL_ADDRESS, // sender address
      to: workerData.userEmail, // list of receivers
      subject: workerData.message.text, // Subject line
      text: workerData.message.text || "Hello", // plain text body
      html: "<b>welcome, <br>use the following credentials to login</b><p> id : "+ workerData.message.id+"<br>password : "+workerData.message.password+"<br> Regards,<br>Test Team</p>" // html body
    });
  
    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
  }
  
  main().then(info=>{
      console.log(info);
        parentPort.postMessage({userEmail : workerData, status : 'done'});
  }).catch(console.error);