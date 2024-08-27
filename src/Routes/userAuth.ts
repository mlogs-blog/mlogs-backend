import { Router } from "express";
import { signup, signin, verifyOTP, sendOTP } from "../Controllers/user-auth.controllers";


const userAuth = Router();

userAuth.post("/signup", signup);
userAuth.post("/signin", signin);
userAuth.post("/sendOTP", sendOTP);
userAuth.post("/verifyOTP", verifyOTP);

export default userAuth;