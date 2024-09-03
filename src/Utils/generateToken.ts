import dotenv from "dotenv";
import { User } from "@prisma/client";
import jwt from "jsonwebtoken";
import prisma from "../Services/prismaclient";

dotenv.config();

const generateToken = async (user: User) => {
  try {
    const payload = {
      userID: user.id,
      email: user.email,
      isVerified: user.isVerified,
    };

    // Access token generation
    const accessTokenExpiry = Math.floor(Date.now() / 1000) + 15 * 60; // 15 minutes from now
    const accessTokenSecretKey =
      process.env.JWT_ACCESS_TOKEN_SECRET_KEY || "accesstokensecret";
    const accessToken = jwt.sign(
      { ...payload, exp: accessTokenExpiry },
      accessTokenSecretKey
    );

    // Refresh Token generation
    const refreshTokenCreateTime = new Date();
    const refreshTokenExpiry = Math.floor(Date.now() / 1000) + 5 * 24 * 60 * 60; // 5 days from now
    const refreshTokenSecretKey =
      process.env.JWT_REFRESH_TOKEN_SECRET_KEY || "refreshtokensecret";
    const refreshToken = jwt.sign(
      { ...payload, exp: refreshTokenExpiry },
      refreshTokenSecretKey
    );

    // Save refresh token to db
    await prisma.refreshToken.upsert({
      where: {
        userId: user.id,
      },
      update: {
        refreshToken: refreshToken,
        createdAt: refreshTokenCreateTime,
        expiresIn: new Date(refreshTokenExpiry * 1000), // Convert back to Date object for DB storage
      },
      create: {
        refreshToken: refreshToken,
        userId: user.id,
        createdAt: refreshTokenCreateTime,
        expiresIn: new Date(refreshTokenExpiry * 1000), // Convert back to Date object for DB storage
      },
    });

    // Convert Unix timestamp to Date object for access token expiry to be returned
    const accessTokenExpiryDate = new Date(accessTokenExpiry * 1000);

    // Return
    return {
      accessToken,
      accessTokenExpiry: accessTokenExpiryDate, // Converted back to Date object for usage
      refreshToken,
      refreshTokenExpiry: new Date(refreshTokenExpiry * 1000), // Converted back to Date object for usage
    };
  } catch (error) {
    console.error("Error generating token:", error);
    throw new Error("Unable to generate the tokens.");
  }
};

export default generateToken;
