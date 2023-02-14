const bcrypt = require("bcryptjs");
const UserModel = require("../models/User");
const jwt = require("jsonwebtoken");
const imageDownloader = require("image-downloader");
const fs = require("fs");

const bcryptSalt = bcrypt.genSaltSync(10);

module.exports = {
  register: async (req, res) => {
    const { name, email, password } = req.body;
    try {
      const newUser = await UserModel.create({
        name,
        email,
        password: bcrypt.hashSync(password, bcryptSalt),
      });
      res.json(newUser);
    } catch (error) {
      res.status(422).json(error);
    }
  },

  login: async (req, res) => {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    if (user) {
      const pass = bcrypt.compareSync(password, user.password);
      if (pass) {
        jwt.sign(
          { email: user.email, id: user._id },
          process.env.JWT_KEY,
          {},
          (error, token) => {
            if (error) throw error;
            res.cookie("token", token).json(user);
          }
        );
      } else {
        res.status(422).json("password doesn't match");
      }
    } else {
      res.json("not found");
    }
  },

  profile: (req, res) => {
    const { token } = req.cookies;
    if (token) {
      jwt.verify(token, process.env.JWT_KEY, {}, async (error, userData) => {
        if (error) throw error;
        const { name, email, _id } = await UserModel.findById(userData.id);
        res.json({ name, email, _id });
      });
    } else {
      res.json(null);
    }
  },

  uploadbylink: async (req, res) => {
    console.log(process.cwd(), "8978978974546545622 3312123");
    const { link } = req.body;
    const newName = "photo" + Date.now() + ".jpg";
    await imageDownloader.image({
      url: link,
      dest: process.cwd() + "/public/photos/" + newName,
    });
    res.json(newName);
  },

  upload: async (req, res) => {
    const uploadedFiles = [];
    for (let i = 0; i < req.files.length; i++) {
      const { path, originalname } = req.files[i];
      const parts = originalname.split(".");
      const ext = parts[parts.length - 1];
      const newPath = path + "." + ext;
      fs.renameSync(path, newPath);
      uploadedFiles.push(newPath.replace("public/photos", ""));
    }
    res.json(uploadedFiles);
  },

  logout: (req, res) => {
    res.cookie("token", "").json(true);
  },
};
