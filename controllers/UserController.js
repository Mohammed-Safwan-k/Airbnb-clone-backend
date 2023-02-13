const bcrypt = require("bcryptjs");
const UserModel = require("../models/User");

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
};
