import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors"

const app = express()

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  Credential: true
}))

app.use(express.json({
  limit: "16kb"
}))

app.use(express.urlencoded({
  extended: true,
  limit: "16kb"
}))
app.use(express.static("Public"))
app.use(cookieParser())


// routes import
import userRouter from './routes/user.router.js'


// routes decleration
app.use("/api/v1/users", userRouter)
// http://localhost:8000/api/v1/users

export { app }