import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const PORT = Number(process.env.MAILER_PORT) || 587;

const transporter = nodemailer.createTransport({
    service: "gmail", // Automatically sets host and port for Gmail
    port: PORT,
    secure: PORT === 465, // true for port 465, false for other ports
    auth: {
        user: process.env.EMAIL, // Your Gmail address
        pass: process.env.PASSWORD, // Your Gmail password or App Password
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