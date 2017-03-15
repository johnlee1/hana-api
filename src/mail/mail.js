'use strict';


const aws = require('aws-sdk');
const ejs = require('ejs');
const fs = require('fs');
const nodemailer = require('nodemailer');


// configure AWS SDK
aws.config.loadFromPath('./src/mail/awsconfig.json');
aws.config.correctClockSkew = true;


// create nodemailer ses transporter
let transporter = nodemailer.createTransport({
    SES: new aws.SES({
        apiVersion: '2017-2-17'
    })
});

exports.getMailTemplate = (path) => {
    return fs.readFileSync(path, 'utf8');
};


exports.sendEmail = (subject, templateFile, email, datas) => {
    let template = ejs.compile(templateFile.toString());
    let mailOptions = {
        from: process.env.MAIL_EMAIL,
        to: email,
        subject: subject,
        html: template(datas)
    };

    transporter.sendMail(mailOptions, (err) => {
        if (err) {
            throw err;
        }   
        transporter.close();
    });
};
