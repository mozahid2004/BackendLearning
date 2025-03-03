import { Router } from "express";
import { registerUser, logoutUser, loginUser, refreshAccessToken } from "../controlers/user.controler.js";
import { upload } from "../middlewares/multer.middlewere.js";
import { verifyJWT } from "../middlewares/auth.middlewere.js";

const router = Router()

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCout: 1
    },
    {
      name: "coverImage",
      maxCout: 1
    }
  ]),
  registerUser
)

router.route("/login").post(loginUser)


// secured Routes
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refresh-token").post(refreshAccessToken)

export default router