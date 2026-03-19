import { Router } from "express";
import { changePassword,
    getCurrentUser,
    getUserChannelProfile,
    getWatchHistory,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    updateAccountDetails,
    updateAvatarImage,
    updateCoverImage
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
router.route("/channel/:username").get(verifyAccessToken, getUserChannelProfile);
router.route("/history").get(verifyAccessToken, getWatchHistory);

router.route("/update").patch(verifyAccessToken, updateAccountDetails);
router.route("/update/avatar").patch(verifyAccessToken, upload.single("avatar"), updateAvatarImage);
router.route("update/cover-image").patch(verifyAccessToken, upload.single("coverImage"), updateCoverImage);


export default router;