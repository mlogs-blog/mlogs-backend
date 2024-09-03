import jwt from "jsonwebtoken";

const isTokenExp = (token: string): boolean => {
  try {
    // Decode the token to get its payload
    const decoded = jwt.decode(token) as { exp: number } | null;

    // If the token cannot be decoded, it's invalid
    if (!decoded || !decoded.exp) {
      return true; // Treat as expired if decoding fails
    }

    // Get the current time in seconds
    const currentTime = Math.floor(Date.now() / 1000);

    // Check if the token has expired
    return decoded.exp < currentTime;
  } catch (error) {
    console.error("Error decoding token:", error);
    return true; // Treat as expired if an error occurs
  }
};

export default isTokenExp;
