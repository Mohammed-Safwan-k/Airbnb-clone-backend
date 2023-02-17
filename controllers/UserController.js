const bcrypt = require("bcryptjs");
const UserModel = require("../models/User");
const jwt = require("jsonwebtoken");
const imageDownloader = require("image-downloader");
const fs = require("fs");
const PlaceModel = require("../models/Place");
const BookingModel = require("../models/Booking");

const tokenMiddleware = require("../middleware/token");

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

  addplaces: (req, res) => {
    const { token } = req.cookies;
    const {
      title,
      address,
      addedPhotos,
      description,
      perks,
      extraInfo,
      checkIn,
      checkOut,
      maxGuests,
      price,
    } = req.body;

    jwt.verify(token, process.env.JWT_KEY, {}, async (error, userData) => {
      if (error) throw error;
      const placeDoc = await PlaceModel.create({
        owner: userData.id,
        title,
        address,
        photos: addedPhotos,
        description,
        perks,
        extraInfo,
        checkIn,
        checkOut,
        maxGuests,
        price,
      });
      res.json(placeDoc);
    });
  },

  allUserPlaces: (req, res) => {
    const { token } = req.cookies;
    jwt.verify(token, process.env.JWT_KEY, {}, async (error, userData) => {
      const { id } = userData;
      const places = await PlaceModel.find({ owner: id });
      res.json(places);
    });
  },

  editPlaces: async (req, res) => {
    const { id } = req.params;
    const placeData = await PlaceModel.findById(id);
    res.json(placeData);
  },

  updateplaces: async (req, res) => {
    const { token } = req.cookies;
    const {
      id,
      title,
      address,
      addedPhotos,
      description,
      perks,
      extraInfo,
      checkIn,
      checkOut,
      maxGuests,
      price,
    } = req.body;
    jwt.verify(token, process.env.JWT_KEY, {}, async (error, userData) => {
      if (error) throw error;
      const placeDoc = await PlaceModel.findById(id);
      //here userData.id is in string the placeDoc.owner is an objectId so to make it string we use this
      if (userData.id === placeDoc.owner.toString()) {
        placeDoc.set({
          title,
          address,
          photos: addedPhotos,
          description,
          perks,
          extraInfo,
          checkIn,
          checkOut,
          maxGuests,
          price,
        });
        await placeDoc.save();
        res.json("ok");
      }
    });
  },

  allPlaces: async (req, res) => {
    const allPlaces = await PlaceModel.find();
    res.json(allPlaces);
  },

  singlePlace: async (req, res) => {
    const { id } = req.params;
    const placeData = await PlaceModel.findById(id);
    res.json(placeData);
  },

  booking: async (req, res) => {
    const { token } = req.cookies;
    const userData = await tokenMiddleware.getUserDataFromToken(token);
    const {
      place,
      checkIn,
      checkOut,
      numberOfGuests,
      name,
      email,
      phone,
      price,
    } = req.body;
    BookingModel.create({
      user: userData.id,
      place,
      checkIn,
      checkOut,
      numberOfGuests,
      name,
      email,
      phone,
      price,
    })
      .then((doc) => {
        res.json(doc);
      })
      .catch((err) => {
        throw err;
      });
  },

  allBookings: async (req, res) => {
    const { token } = req.cookies;
    // also we can pass by using getUserDataFromToken(req) if we are using req there
    const userData = await tokenMiddleware.getUserDataFromToken(token);
    res.json(await BookingModel.find({ user: userData.id }).populate('place'));
  },

  logout: (req, res) => {
    res.cookie("token", "").json(true);
  },
};
