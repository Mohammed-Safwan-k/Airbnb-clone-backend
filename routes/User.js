const express = require("express");
const multer = require("multer");
const router = express.Router();

const controller = require("../controllers/UserController");

//****************************** POST ROUTES ****************************** //

router.post("/register", controller.register);

router.post("/login", controller.login);

router.post("/logout", controller.logout);

router.post("/upload-by-link", controller.uploadbylink);

const photosMiddleware = multer({ dest: "public/photos/" });
router.post(
  "/upload",
  photosMiddleware.array("photos", 100),
  controller.upload
);

//****************************** GET ROUTES ****************************** //

router.get("/profile", controller.profile);

module.exports = router;
