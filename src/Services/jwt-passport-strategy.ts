import {
  Strategy as JWTStrategy,
  ExtractJwt,
  StrategyOptions,
} from "passport-jwt";
import passport from "passport";
import dotenv from "dotenv";
import prisma from "../Services/prismaclient"; // Assuming you use Prisma for database access

dotenv.config();

const opts: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_ACCESS_TOKEN_SECRET_KEY as string,
};

passport.use(
  new JWTStrategy(opts, async (jwt_payload, done) => {
    try {
      // Find the user associated with the token's payload
      const user = await prisma.user.findUnique({
        where: {
          id: jwt_payload.userID,
        },
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          isSubscribed: true
        },
      });

      if (user) {
        return done(null, user); // Pass the user to the next middleware
      } else {
        return done(null, false); // No user found
      }
    } catch (error) {
      return done(error, false); // Pass the error to the next middleware
    }
  })
);


