import { z } from "zod";

// Constants for Reusability
const MIN_USERNAME_LENGTH = 5;
const MIN_PASSWORD_LENGTH = 8;
const MIN_TITLE_LENGTH = 5;
const MIN_BODY_LENGTH = 100;

// Signup Schema
const SignupSchema = z.object({
    email: z.string().email().trim().toLowerCase(),
    username: z.string()
        .min(MIN_USERNAME_LENGTH, { message: `Username must be at least ${MIN_USERNAME_LENGTH} characters long` })
        .toLowerCase(),
    name: z.string()
        .min(1, { message: "Name is required" }),
    password: z.string()
        .min(MIN_PASSWORD_LENGTH, { message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long` }),
    confirmPassword: z.string()
        .min(MIN_PASSWORD_LENGTH, { message: `Confirm Password must be at least ${MIN_PASSWORD_LENGTH} characters long` }),
    role: z.enum(["USER", "ADMIN"]).default("USER"),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

//Signin Schema
const SigninSchema = z.object({
    username: z.string(),
    password: z.string()
        .min(MIN_PASSWORD_LENGTH, { message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long` })
})

// Post Schema
const PostSchema = z.object({
    title: z.string()
        .min(MIN_TITLE_LENGTH, { message: `Title must be at least ${MIN_TITLE_LENGTH} characters long` }),
    body: z.string()
        .min(MIN_BODY_LENGTH, { message: `Body must be at least ${MIN_BODY_LENGTH} characters long` }),
});

export { SignupSchema, SigninSchema, PostSchema };