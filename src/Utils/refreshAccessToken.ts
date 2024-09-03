import { Request, Response } from "express";
import verifyRefreshToken from "./verifyRefreshToken";
import prisma from "../Services/prismaclient";
import generateToken from "./generateToken";

const refreshAccessToken = async (
  req: Request,
  res: Response
): Promise<{
  newAccessToken: string;
  newAccessTokenExpiry: Date;
  newRefreshToken: string;
  newRefreshTokenExpiry: Date;
} | null> => {
  try {
    const refreshCookie = req.cookies.refreshToken;
    const { decoded } = await verifyRefreshToken(refreshCookie);

    if (!decoded) {
      return null;
    }

    const refreshTokenUser = await prisma.user.findUnique({
      where: { id: decoded.userID },
    });

    if (!refreshTokenUser) {
      throw new Error("No user with the given refresh token found");
    }

    const foundedUserRefreshToken = await prisma.refreshToken.findUnique({
      where: { userId: refreshTokenUser.id },
    });

    const areTokensSame =
      foundedUserRefreshToken?.refreshToken === refreshCookie;

    if (!areTokensSame) {
      throw new Error("Unauthorized access");
    }

    const newToken = await generateToken(refreshTokenUser);

    return {
      newAccessToken: newToken.accessToken,
      newAccessTokenExpiry: newToken.accessTokenExpiry,
      newRefreshToken: newToken.refreshToken,
      newRefreshTokenExpiry: newToken.refreshTokenExpiry,
    };
  } catch (error) {
    console.log("Error in refresh access token file: ", error);
    return null;
  }
};

export default refreshAccessToken;
