const nodemailer = require("nodemailer")
require("dotenv").config()

const nodemailerTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD
    }
});

module.exports = nodemailerTransporter;