import { Response } from "express";

const setCookies = (
  res: Response,
  accessToken: string,
  accessTokenExpiry: Date,
  refreshToken: string,
  refreshTokenExpiry: Date
) => {
  try {
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: accessTokenExpiry,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: refreshTokenExpiry,
    });
  } catch (error) {
    console.error("Error setting cookies:", error);
    throw new Error("Error in setting cookies");
  }
};

export default setCookies;
