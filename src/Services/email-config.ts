import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const PORT = Number(process.env.MAILER_PORT) || 587;

const transporter = nodemailer.createTransport({
    service: "outlook",
    port: PORT,
    secure: PORT === 465,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
    },
});

// Debugging
transporter.verify((error, success) => {
    if (error) {
        console.error("Error verifying mail transport configuration:", error);
    } else {
        console.log("Mail transport is configured correctly.");
    }
});

export default transporter;