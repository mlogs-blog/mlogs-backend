import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import {
  VerifyOTPSchema,
  SendOTPSchema,
  SigninSchema,
  SignupSchema,
} from "@devmayanktiwari/mlogs2.0";
import { HttpStatusCode } from "../Utils/status-codes";
import prisma from "../Services/prismaclient";
import APIResponse from "../Utils/api-response";
import CustomError from "../Utils/api-error";
import generateAndSendOTP from "../Utils/send-otp";
import { totp } from "otplib";
import generateToken from "../Utils/generateToken";
import setCookies from "../Utils/setCookies";
import refreshAccessToken from "../Utils/refreshAccessToken";

dotenv.config();

export const signup = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const parsed = SignupSchema.safeParse(body);

    // Sanitize the inputs
    if (!parsed.success) {
      throw new CustomError(
        HttpStatusCode.BadRequest,
        "Invalid inputs",
        parsed.error?.issues
      );
    }

    // EMAIL CHECK HERE
    // --------------------
    // // Check for email validity
    // const isEmailValid = await validate(parsed.data.email);
    // if (!isEmailValid.valid) {
    //     throw new CustomError(HttpStatusCode.BadRequest, "Invalid email", [isEmailValid.reason]);
    // }

    // Check for Existing user with email
    const userEmail = await prisma.user.findUnique({
      where: {
        email: parsed.data.email,
      },
    });
    if (userEmail) {
      throw new CustomError(HttpStatusCode.Forbidden, "User already exists", [
        "Email already exists",
      ]);
    }

    // Check for user with username
    const userUsername = await prisma.user.findUnique({
      where: {
        username: parsed.data.username,
      },
    });
    if (userUsername) {
      throw new CustomError(HttpStatusCode.Forbidden, "User already exists", [
        "Username already taken",
      ]);
    }

    // Hash Password
    const saltRounds = process.env.SALT_ROUNDS || 10;
    const salt = bcrypt.genSaltSync(Number(saltRounds));
    const hashedPassword = bcrypt.hashSync(parsed.data.password, salt);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        username: parsed.data.username,
        role: "USER",
        password: hashedPassword,
        isSubscribed: parsed.data.isSubscribed,
        isVerified: parsed.data.isVerified,
      },
    });

    // Return response
    const ans = APIResponse.create(HttpStatusCode.Created, "User Created", {
      id: newUser.id,
      email: newUser.email,
      isVerified: newUser.isVerified,
    });
    return res.status(HttpStatusCode.Created).json(ans.format());
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json(error.format());
    } else {
      console.log(error);
      return res.status(HttpStatusCode.InternalServerError).json({
        error: "Something went wrong.",
      });
    }
  }
};

export const signin = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const parsed = SigninSchema.safeParse(body);

    // Sanitize Inputs
    if (!parsed.success) {
      throw new CustomError(
        HttpStatusCode.BadRequest,
        "Invalid inputs",
        parsed.error?.issues
      );
    }

    // Find a user
    const user = await prisma.user.findUnique({
      where: {
        username: parsed.data.username,
      },
    });
    if (!user) {
      throw new CustomError(HttpStatusCode.NotFound, "User not found", [
        "Username or password is incorrect",
      ]);
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(
      parsed.data.password,
      user.password
    );
    if (!passwordMatch) {
      throw new CustomError(HttpStatusCode.Forbidden, "Invalid credentials", [
        "Username or password is incorrect",
      ]);
    }

    // Check if the user is verified send the token
    if (user.isVerified) {
      const {
        accessToken,
        accessTokenExpiry,
        refreshToken,
        refreshTokenExpiry,
      } = await generateToken(user);

      setCookies(
        res,
        accessToken,
        accessTokenExpiry,
        refreshToken,
        refreshTokenExpiry
      );
    }

    // Return user
    const ans = APIResponse.create(HttpStatusCode.OK, "User found", {
      userId: user.id,
      username: user.username,
      email: user.email,
      isVerified: user.isVerified,
    });

    return res.status(HttpStatusCode.OK).json(ans.format());
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json(error.format());
    } else {
      console.log(error);
      return res.status(HttpStatusCode.InternalServerError).json({
        error: "Something went wrong.",
      });
    }
  }
};

export const sendOTP = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const parsed = SendOTPSchema.safeParse(body);
    if (!parsed.success) {
      throw new CustomError(
        HttpStatusCode.BadRequest,
        "Invalid email type.",
        parsed.error.issues
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: {
        id: parsed.data.userId,
      },
    });
    if (!user) {
      throw new CustomError(HttpStatusCode.Forbidden, "Database error", [
        "Unable to find user",
      ]);
    }

    // Check if the email is edited for OTP sending
    const isEmailValid = user.email === parsed.data.email;

    // Update email, if changed
    if (!isEmailValid) {
      await prisma.user.update({
        where: {
          id: parsed.data.userId,
        },
        data: {
          email: parsed.data.email,
        },
      });
    }

    // OTP generation
    const otpSendResponse = await generateAndSendOTP(user);
    if (!otpSendResponse) {
      throw new CustomError(
        HttpStatusCode.InternalServerError,
        "Unable to verify",
        ["Unable to sent OTP"]
      );
    }

    const ans = APIResponse.create(
      HttpStatusCode.Created,
      "OTP sent successfully",
      {
        id: user.id,
        email: user.email,
        isVerified: user.isVerified,
      }
    );
    return res.status(HttpStatusCode.OK).json(ans.format());
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json(error.format());
    } else {
      console.log("Error in send otp controller", error);
      return res.status(500).json({
        error: "Something went wrong.",
      });
    }
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  try {
    // Fetching input and validations
    const body = req.body;
    const parsed = VerifyOTPSchema.safeParse(body);
    if (!parsed.success) {
      throw new CustomError(
        HttpStatusCode.BadRequest,
        "Invalid OTP type.",
        parsed.error.issues
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: {
        email: parsed.data.email,
        id: parsed.data.userId,
      },
    });

    if (!user) {
      throw new CustomError(HttpStatusCode.Forbidden, "Database error", [
        "Unable to find user",
      ]);
    }
    // Fetch OTP entry
    const entry = await prisma.oTP.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (!entry) {
      throw new CustomError(HttpStatusCode.NotFound, "OTP entry not found", [
        "No OTP entry for the user",
      ]);
    }

    const { secret, createdAt, expiresIn } = entry;

    // Check if OTP has expired
    if (new Date() > new Date(expiresIn)) {
      throw new CustomError(HttpStatusCode.Unauthorized, "OTP expired", [
        "The OTP you entered has expired",
      ]);
    }

    // Validate OTP
    const isValidOTP = totp.check(String(parsed.data.otp), secret);
    if (!isValidOTP) {
      throw new CustomError(HttpStatusCode.Unauthorized, "Unauthorized", [
        "OTP is incorrect",
      ]);
    }

    // Updating isVerified
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        isVerified: true,
      },
    });

    // Mark OTP as used or delete it
    await prisma.oTP.delete({
      where: {
        userId: user.id,
      },
    });

    // Return response
    const ans = APIResponse.create(HttpStatusCode.OK, "OTP Verified", {
      id: user.id,
      email: user.email,
      isVerified: true,
    });

    return res.status(HttpStatusCode.OK).json(ans.format());
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json(error.format());
    } else {
      console.log("Error in verify OTP controller:", error);
      return res.status(HttpStatusCode.InternalServerError).json({
        error: "Something went wrong.",
      });
    }
  }
};

export const getNewAccessToken = async (req: Request, res: Response) => {
  try {
    // Get new access token
    const tokens = await refreshAccessToken(req, res);

    // Check if tokens are valid
    if (!tokens) {
      return res.status(500).json({ error: "Unable to refresh token" });
    }

    // Set new tokens to cookies
    setCookies(
      res,
      tokens.newAccessToken,
      tokens.newAccessTokenExpiry,
      tokens.newRefreshToken,
      tokens.newRefreshTokenExpiry
    );

    // Create and send a response
    const ans = APIResponse.create(HttpStatusCode.OK, "Cookies updated");

    return res.status(HttpStatusCode.OK).json(ans.format());
  } catch (error) {
    console.log("Error in refreshing new token: ", error);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};
