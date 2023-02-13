const express = require("express");
const router = express.Router();

const controller = require("../controllers/UserController");

//****************************** POST ROUTES ****************************** //

router.post("/register", controller.register);

router.post("/login", controller.login);

router.post("/logout", controller.logout);

//****************************** GET ROUTES ****************************** //

router.get("/profile", controller.profile);

module.exports = router;
