import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieparser from "cookie-parser"
import passport from "passport"
const app = express()

// Route imports
import userAuth from "./Routes/userAuth";

// CONSTANTS
dotenv.config()
const PORT = process.env.PORT ;
const FRONTEND_URL = process.env.FRONTEND_URL;

// CORS Config
const corsOptions = {
    origin: FRONTEND_URL,
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Cookie parser
app.use(cookieparser());

//JSON
app.use(express.json());

// Passport
app.use(passport.initialize())

// Health check
app.get("/api/v1/health", (req, res) => {
    res.status(200).json("Server is healthy");
})

// User routes for posting blogs
app.use("/api/v1/user/auth", userAuth);
// app.use("/api/v1/blogs", getBlogs);
// app.use("/api/v1/reactions", reactionHandler);

// Admin Routes for Sign in and posting blogs

// app.use("/api/v1/admin/auth", adminRoutes);

app.listen(PORT, () => {
    console.log(`App is running on port ${PORT}`);
})

export default app;

