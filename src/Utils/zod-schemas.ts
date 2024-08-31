import { z } from "zod";

// Constants for Reusability
const MIN_USERNAME_LENGTH = 5;
const MIN_PASSWORD_LENGTH = 8;
const MIN_TITLE_LENGTH = 5;
const MIN_BODY_LENGTH = 100;
const OTP_LENGTH = 6;

// Signup Schema
const SignupSchema = z
  .object({
    email: z.string().email().trim().toLowerCase(),
    username: z
      .string()
      .min(MIN_USERNAME_LENGTH, {
        message: `Username must be at least ${MIN_USERNAME_LENGTH} characters long`,
      })
      .toLowerCase(),
    name: z.string().min(1, { message: "Name is required" }),
    password: z
      .string()
      .min(MIN_PASSWORD_LENGTH, {
        message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
      }),
    confirmPassword: z
      .string()
      .min(MIN_PASSWORD_LENGTH, {
        message: `Confirm Password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
      }),
    role: z.enum(["USER", "ADMIN"]).default("USER"),
    isVerified: z.boolean().default(false),
    isSubscribed: z.boolean().default(false),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

//Signin Schema
const SigninSchema = z.object({
  username: z.string(),
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, {
      message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
    }),
});

// Post Schema
const PostSchema = z.object({
  title: z
    .string()
    .min(MIN_TITLE_LENGTH, {
      message: `Title must be at least ${MIN_TITLE_LENGTH} characters long`,
    }),
  body: z
    .string()
    .min(MIN_BODY_LENGTH, {
      message: `Body must be at least ${MIN_BODY_LENGTH} characters long`,
    }),
});

// OTP Schema
const VerifyOTPSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  userId: z.string().uuid(),
  otp: z
    .number()
    .min(6, { message: `OTP must be at least ${OTP_LENGTH} long` }),
});

const SendOTPSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().trim().toLowerCase(),
});

export {
  SignupSchema,
  SigninSchema,
  PostSchema,
  VerifyOTPSchema,
  SendOTPSchema,
};
