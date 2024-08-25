import { Router } from "express";
import { signup, signin } from "../Controllers/user-auth.controllers";

const userAuth = Router();

userAuth.post("/signup", signup);
userAuth.post("/signin", signin);

export default userAuth;