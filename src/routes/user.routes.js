import { Router } from "express";
import { changePassword,
    getCurrentUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    updateAccountDetails
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyAccessToken, verifyRefreshToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
);

router.route("/login").post(loginUser);


// --------- Secured Routes -----------
router.route("/logout").post(verifyAccessToken, logoutUser);
router.route("/refresh/token").post(verifyRefreshToken, refreshAccessToken);
router.route("/update/password").post(verifyAccessToken, changePassword);
router.route("/current").get(verifyAccessToken, getCurrentUser);
router.route("/update").patch(verifyAccessToken, updateAccountDetails);

export default router;