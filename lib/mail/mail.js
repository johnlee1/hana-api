'use strict';


const Fs = require('fs');
const NodeMailer = require('nodemailer');
const Ejs = require('ejs');

// const Parameters = require('../../config/parameters').mail;


const gmailTransport = NodeMailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD
    }
});


exports.getMailTemplate = (path) => {
    return Fs.readFileSync(path, 'utf8');
};


exports.sendHtmlEmail = (subject, templateFile, email, datas) => {
    let template = Ejs.compile(templateFile.toString());
    let mailOptions = {
        from: process.env.MAIL_EMAIL,
        to: email,
        subject: subject,
        html: template(datas)
    };

    gmailTransport.sendMail(mailOptions, (err, res) => {
        if (err) {
            throw err;
        }
        gmailTransport.close();
    });
};