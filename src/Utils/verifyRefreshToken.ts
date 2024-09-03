import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import prisma from "../Services/prismaclient";

dotenv.config();

type DecodedType = {
  userID: string;
  email: string;
  isVerified: boolean;
};

const verifyRefreshToken = async (
  refreshToken: string
): Promise<{ success: boolean; decoded?: DecodedType; message?: string }> => {
  try {
    // Extract the secret key for token verification
    const secret =
      process.env.JWT_REFRESH_TOKEN_SECRET_KEY || "refreshtokensecret";

    // Retrieve the refresh token from the database
    const userRefreshToken = await prisma.refreshToken.findFirst({
      where: { refreshToken },
    });

    if (!userRefreshToken) {
      return {
        success: false,
        message: "No such refresh token found. Please log in again.",
      };
    }

    // Check if the refresh token is expired
    const currentTimestamp = Math.floor(Date.now() / 1000); // Current time in seconds
    const tokenExpiryTimestamp = Math.floor(
      userRefreshToken.expiresIn.getTime() / 1000
    ); // Convert expiry date to seconds

    if (currentTimestamp > tokenExpiryTimestamp) {
      return {
        success: false,
        message: "Refresh token is expired. Please log in again.",
      };
    }

    // Verify the refresh token using JWT
    const decoded = jwt.verify(refreshToken, secret) as DecodedType;

    // Return the decoded token information
    return { success: true, decoded };
  } catch (error) {
    console.error("Error in verifyRefreshToken function:", error);
    return {
      success: false,
      message: "Unable to verify refresh token. Please log in again.",
    };
  }
};

export default verifyRefreshToken;