import {Request, Response} from "express";
import {SigninSchema, SignupSchema} from "../Utils/zod-schemas";
import { HttpStatusCode } from "../Utils/status-codes";
import prisma from "../Services/prismaclient";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import APIResponse from "../Utils/api-response"
import CustomError from "../Utils/api-error"
import generateAndSendOTP from "../Utils/send-verify-otp";

dotenv.config();

export const signup = async (req: Request, res: Response) => {
    try {
        const body = req.body;
        const parsed = SignupSchema.safeParse(body);

        // Sanitize the inputs
        if (!parsed.success) {
            throw new CustomError(HttpStatusCode.BadRequest, "Invalid inputs", parsed.error?.issues);
        }

        // Check for Existing user with email
        const userEmail = await prisma.user.findUnique({
            where: {
                email : parsed.data.email
            }
        })
        if (userEmail) {
            throw new CustomError(HttpStatusCode.Forbidden, "User already exists", ["Email already exists"]);
        }

        // Check for user with username
        const userUsername = await prisma.user.findUnique({
            where: {
                username : parsed.data.username
            }
        })
        if (userUsername) {
            throw new CustomError(HttpStatusCode.Forbidden, "User already exists", ["Username already taken"]);
        }

        // Hash Password
        const saltRounds = process.env.SALT_ROUNDS || 10;
        const salt =  bcrypt.genSaltSync(Number(saltRounds));
        const hashedPassword = bcrypt.hashSync(parsed.data.password, salt);

        // Create user
        const newUser = await prisma.user.create({
            data: {
                name: parsed.data.name,
                email: parsed.data.email,
                username: parsed.data.username,
                role: "USER",
                password: hashedPassword
            }
        })

        await generateAndSendOTP(newUser);
        // Return response
        const ans = APIResponse.create(HttpStatusCode.Created, "User Created", {id: newUser.id})
        return res.status(HttpStatusCode.Created).json(ans.format());

    } catch (error) {
        if (error instanceof CustomError) {
            return res.status(error.statusCode).json(error.format())
        } else {
            console.log(error);
            return res.status(HttpStatusCode.InternalServerError).json({
                error: "Something went wrong."
            })
        }
    }
}

export const signin = async (req: Request, res: Response) => {
    try {
        const body = req.body;
        const parsed = SigninSchema.safeParse(body);

        // Sanitize Inputs
        if (!parsed.success) {
            throw new CustomError(HttpStatusCode.BadRequest, "Invalid inputs", parsed.error?.issues);
        }

        // Find a user
        const user = await prisma.user.findUnique({
            where: {
                username: parsed.data.username,
            }
        })
        if (!user) {
            throw new CustomError(HttpStatusCode.NotFound, "User not found", ["Username or password is incorrect"]);
        }

        // Compare password
        const passwordMatch = await bcrypt.compare(parsed.data.password, user.password);
        if (!passwordMatch) {
            throw new CustomError(HttpStatusCode.Forbidden, "Invalid credentials", ["Username or password is incorrect"])
        }

        // Return user
        const ans = APIResponse.create(HttpStatusCode.OK, "User found", {
            userId : user.id,
            username : user.username
        })
        return res.status(HttpStatusCode.OK).json(ans.format());
    } catch (error) {
        if (error instanceof CustomError) {
            return res.status(error.statusCode).json(error.format())
        } else {
            console.log(error);
            return res.status(HttpStatusCode.InternalServerError).json({
                error: "Something went wrong."
            })
        }
    }
}