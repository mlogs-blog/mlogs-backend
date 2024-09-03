import { Router } from "express";
import passport from "passport";
import "../Services/jwt-passport-strategy";
import { getProfile } from "../Controllers/protected.controller";

const protectedRoutes = Router();

protectedRoutes.get("/me", passport.authenticate("jwt", {session: false}), getProfile);

export default protectedRoutes;