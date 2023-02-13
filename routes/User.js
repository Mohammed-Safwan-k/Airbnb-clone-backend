const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const controller = require("../controllers/UserController");

router.post("/register", controller.register);

router.post("/login", controller.login);

router.get("/profile", controller.profile);

module.exports = router;
