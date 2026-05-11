const nodemailer = require("nodemailer");
const fs = require("fs");
const transporter = nodemailer.createTransport({
    service: "gmail", 
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
    },
});

async function sendOTP(email, otp) {
    await transporter.sendMail({
        from: `"Syncbeat" <${process.env.EMAIL}>`,
        to: email,
        subject: "Syncbeat: Your secure One Time Password",
        html: fs.readFileSync("./templates/mail/forgot.html", "utf-8").replace("{{OTP}}", otp),
    });
    return otp;
}

module.exports = sendOTP;