const jwt = require("jsonwebtoken");
const User = require("../model/User");
const bcrypt = require("bcryptjs");

const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: "dumbjuwbh",
  api_key: "425151695591314",
  api_secret: "moLRNDLrNM9zbW0uDn-54ZIoqJE",
});

const all_users = async (req, res, next) => {
  try {
    const user = await User.find();
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }
    return res.status(200).json({ user });
  } catch (err) {
    return console.log(err);
  }
};

const signup = async (req, res, next) => {
  try {
    const { name, dob, gender, password, city, country, description, photo } =
      req.body;
    const existing_user = await User.findOne({ name });
    if (existing_user) {
      return res
        .status(400)
        .json({ message: "User Already Exist!! Login Instead" });
    }

    const hashedPassword = bcrypt.hashSync(password);
    const result = await cloudinary.uploader.upload(photo, {
      folder: "images",
    });

    const user = new User({
      name,
      dob,
      gender,
      password: hashedPassword,
      city,
      country,
      description,
      photo: result.secure_url,
      // photo,
    });
    await user.save();
    return res.status(200).json({ status: 200, user });
  } catch (err) {
    return console.log(err);
  }
};

const login = async (req, res, next) => {
  // console.log(req.cookie.token);
  try {
    const { name, password } = req.body;

    if (!name || !password) {
      return res.status(400).json({ error: "Please fill the data." });
    }

    const existing_user = await User.findOne({ name: name });
    console.log(existing_user);

    if (existing_user) {
      const isPasswordCorrect = await bcrypt.compareSync(
        password,
        existing_user.password
      );

      if (!isPasswordCorrect) {
        return res.status(400).json({ message: "Incorrect Credentials" });
      } else {
        console.log("Login");
        const name = existing_user.name;
        const id = existing_user._id;
        const token = jwt.sign({ id, name }, process.env.SECRET_KEY);
        return res
          .cookie("token", token, {
            // maxAge: 60 * 60 * 1000,
            // httpOnly: true,
            // secure: true,
            // sameSite: "none",
          })
          .status(200)
          .json({ status: 200, message: "Login successful", existing_user });
      }
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const logout = async (req, res, next) => {
  console.log("logout");
  console.log(req.cookies.token);
  try {
    const cookie = req.cookies.token;
    if (cookie !== null) {
      res.clearCookie("token");
      res.json({ status: 200 });
    }
  } catch (error) {
    console.log(error);
  }
};

const search = async (req, res, next) => {
  console.log("start");
  console.log(req.user);
  const { name } = req.body;
  let search_users;
  try {
    search_users = await User.find(
      { name: { $regex: new RegExp(name, "i"), $ne: req.user.name } },
      "name"
    );
    if (!search_users) {
      return res
        .status(404)
        .json({ message: "No user exist by that username" });
    }
    return res
      .status(200)
      .json({ status: 200, message: "User found", search_users });
  } catch (err) {
    console.log("Error ", err);
  }
};

const profile = async (req, res, next) => {
  console.log(req.user);
  try {
    const user = await User.findOne({ name: req.user.name });
    console.log(user);
    return res.status(200).json({ status: 200, message: "Profile data", user });
  } catch (err) {
    console.log("Error: ", err);
  }
};

const use = async (req, res, next) => {
  const { _id } = req.body;
  console.log("user");
  try {
    const user = await User.findOne({ _id });
    console.log(user);
    return res.status(200).json({ status: 200, message: "User data", user });
  } catch (err) {
    console.log("Error: ", err);
  }
};

const follow = async (req, res, next) => {
  const { userName } = req.body;
  const profileName = req.user.name;
  console.log(req.user);
  console.log(userName, profileName);
  try {
    console.log("follow");
    // await User.findOneAndUpdate(
    //   { name: profileName },
    //   { followers: [], followings: [] },
    //   { new: true }
    // );
    const isAlreadyFollower = await User.find({
      name: userName,
      followers: profileName,
    });
    console.log(isAlreadyFollower);

    if (isAlreadyFollower.length > 0) {
      const user = await User.findOneAndUpdate(
        { name: userName },
        { $pull: { followers: profileName } },
        { new: true }
      );

      console.log(user);
      await user.save();
      const user1 = await User.findOneAndUpdate(
        { name: profileName },
        { $pull: { followings: userName } },
        { new: true }
      );
      console.log(user1);
      await user1.save();
      return res
        .status(200)
        .json({ status: 200, message: "User unfollowed", user });
    } else {
      const user = await User.findOneAndUpdate(
        { name: userName },
        { $push: { followers: profileName } },
        { new: true }
      );

      console.log(user);
      await user.save();
      const user1 = await User.findOneAndUpdate(
        { name: profileName },
        { $push: { followings: userName } },
        { new: true }
      );

      console.log(user1);
      await user1.save();
      return res
        .status(200)
        .json({ status: 200, message: "User followed", user });
    }
  } catch (err) {
    console.log("Error: ", err);
  }
};

module.exports = {
  all_users,
  signup,
  login,
  logout,
  search,
  profile,
  use,
  follow,
};
