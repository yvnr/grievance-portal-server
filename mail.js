const nodemailer = require('nodemailer');

module.exports = async (userGmail, subject, message) => {
    try {
        const transporter = nodemailer.createTransport({
            host: `smtp.gmail.com`,
            service: `gmail`,
            auth: {
                user: `yekkalurivayu@gmail.com`,
                pass: `Nandhu*1999`
            }
        });

        const mailOptiions = {
            from: `yekkalurivayu@gmail.com`,
            to: userGmail,
            subject: subject,
            text: message
        };

        const responseFromEmail = await transporter.sendMail(mailOptiions);
        console.log(responseFromEmail.response);

    } catch (err) {
        throw err;
    }
};