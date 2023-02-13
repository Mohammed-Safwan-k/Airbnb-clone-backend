const bcrypt = require("bcryptjs");
const UserModel = require("../models/User");
const jwt = require("jsonwebtoken");

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
};
