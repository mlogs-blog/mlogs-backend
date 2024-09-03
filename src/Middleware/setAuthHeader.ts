import { Request, Response, NextFunction } from "express";
import isTokenExp from "../Utils/isTokenExpired";

const setAuthHeader = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Retrieve the token from cookies
    const accessToken = req.cookies.token;

    // Check if the token exists and is not expired
    if (accessToken && !isTokenExp(accessToken)) {
      // Set the Authorization header
      req.headers["authorization"] = `Bearer ${accessToken}`;
    }
  } catch (error) {
    console.error("Error in setting authorization headers: ", error);
    throw new Error("Error in setting authorization token");
  }

  next();
};

export default setAuthHeader;
