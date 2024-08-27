import { totp } from "otplib";
import dotenv from "dotenv";
import transporter from "../Services/email-config";
import { User } from "@prisma/client";
import prisma from "../Services/prismaclient";

dotenv.config();

const generateAndSendOTP = async (user: User) => {
    try {
        // TOTP options
        totp.options = {
            step: 600, // 10 minutes
            epoch: Date.now()
        };

        const secret = String(Date.now());
        const token = totp.generate(secret);
        const createdAt = new Date();
        const expiresIn = new Date(createdAt.getTime() + 10 * 60 * 1000);

        // Save otp to db
        await prisma.oTP.upsert({
            where: {
                userId: user.id, // The unique identifier for the OTP record
            },
            update: {
                secret,      // Update the secret
                createdAt,   // Update the creation time
                expiresIn,   // Update the expiration time
            },
            create: {
                userId: user.id,  // Create a new OTP record with these values
                secret,
                createdAt,
                expiresIn,
            },
        });

        // OTP email
        await transporter.sendMail({
            from: process.env.FROM,
            to: user.email,
            subject: "Account Security: Verify Your Email with OTP",
            html: `<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <h2 style="color: #007AFE;">Hi ${user.name},</h2>
                    <p>Thank you for signing up on mlogs!</p>
                    <p>To complete your registration and start exploring all the great content, please verify your email address by entering the OTP provided below:</p>
                    <p style="font-size: 1.5em; font-weight: bold; text-align: center;">Your OTP Code: <span style="color: #007AFE;">${token}</span></p>
                    <p>This OTP is valid for the next 10 minutes. If you did not request this verification, please ignore this email.</p>
                    <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
                    <p>Welcome aboard, and happy blogging!</p>
                    <p>Best regards,</p>
                    <p>The mlogs Team</p>
                    <p><a href="#" style="color: #007AFE; text-decoration: none;">Visit mlogs</a></p>
                </div>
                <footer style="text-align: center; margin-top: 20px; font-size: 0.9em; color: #666;">
                    <p>---<br>This is an automated message, please do not reply directly to this email.</p>
                </footer>
            </body>`
        });

        // console.log(`OTP sent successfully ${token}`);
        return true;
    } catch (error) {
        console.error('Error sending OTP:', error);
        return false
    }
};

export default generateAndSendOTP;