const Post = require("../model/Post");
const User = require("../model/User");

const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: "dumbjuwbh",
  api_key: "425151695591314",
  api_secret: "moLRNDLrNM9zbW0uDn-54ZIoqJE",
});

const all_posts = async (req, res, next) => {
  try {
    console.log("All Posts");
    const post = await Post.find({ user: { $ne: req.user.id } }).populate(
      "user"
    );
    if (!post) {
      return res.status(504).json({ message: "No post uploaded" });
    }
    return res.status(200).json({ status: 200, message: "All Posts", post });
  } catch (err) {
    return console.log(err);
  }
};

const addPost = async (req, res, next) => {
  console.log("Add Post");
  console.log(req.user);
  const { topic, text, photo } = req.body;
  try {
    const result = await cloudinary.uploader.upload(photo, {
      folder: "postImages",
    });
    const post = new Post({
      topic,
      text,
      photo: result.secure_url,
      likes: 0,
      saved: 0,
      share: 0,
      user: req.user.id,
    });
    await post.save();
    console.log("addPost");
    console.log(post.user);
    return res.status(200).json({ status: 200, message: "Post added", post });
  } catch (err) {
    console.log(err);
  }
};

const deletePost = async (req, res, next) => {
  console.log("Delete Post");
  const { _id } = req.body;
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.user.id },
      { $pull: { saved: _id, liked: _id } },
      { new: true }
    );
    await user.save();
    console.log(user);
    const post = await Post.findOneAndRemove({ user: req.user.id, _id: _id });
    console.log(post);
    return res.status(200).json({ status: 200, message: "Post Deleted" });
  } catch (error) {
    console.log(error);
  }
};

const signedUserPosts = async (req, res, next) => {
  try {
    console.log("SignedUserPost");
    const post = await Post.find({ user: req.user.id }).populate("user");
    console.log(post);
    return res
      .status(200)
      .json({ status: 200, message: "Signed User Posts", post });
  } catch (err) {
    console.log(err);
  }
};

const userPosts = async (req, res, next) => {
  try {
    console.log("UserPosts");
    const { _id } = req.body;
    console.log(_id);
    const post = await Post.find({ user: _id }).populate("user");
    console.log(post);
    return res.status(200).json({ status: 200, message: "User Posts", post });
  } catch (err) {
    console.log(err);
  }
};

const saved = async (req, res, next) => {
  try {
    console.log("Saved");
    const { _id } = req.body;
    const initial = await User.findOne({ _id: req.user.id, saved: _id });
    if (initial) {
      const post = await Post.findOneAndUpdate(
        { _id },
        { $inc: { saved: -1 } },
        { new: true }
      );
      await post.save();
      const user = await User.findOneAndUpdate(
        { _id: req.user.id },
        { $pull: { saved: _id } },
        { new: true }
      );
      await user.save();
      console.log(post, user);
      return res.status(200).json({ status: 200, message: "Post unsaved" });
    } else {
      const post = await Post.findOneAndUpdate(
        { _id },
        { $inc: { saved: 1 } },
        { new: true }
      );
      await post.save();
      const user = await User.findOneAndUpdate(
        { _id: req.user.id },
        { $push: { saved: _id } },
        { new: true }
      );
      await user.save();
      console.log(post, user);
      return res.status(200).json({ status: 200, message: "Post saved" });
    }
  } catch (err) {
    console.log(err);
  }
};

const liked = async (req, res, next) => {
  try {
    console.log("Liked");
    const { _id } = req.body;
    const initial = await User.findOne({ _id: req.user.id, liked: _id });
    console.log(initial);

    if (initial) {
      const post = await Post.findOneAndUpdate(
        { _id },
        { $inc: { likes: -1 } },
        { new: true }
      );
      await post.save();
      const user = await User.findOneAndUpdate(
        { _id: req.user.id },
        { $pull: { liked: _id } },
        { new: true }
      );
      await user.save();
      console.log(post, user);
      const likes = post.likes;
      return res
        .status(200)
        .json({ status: 200, message: "Post unliked", likes });
    } else {
      const post = await Post.findOneAndUpdate(
        { _id },
        { $inc: { likes: 1 } },
        { new: true }
      );
      await post.save();
      const user = await User.findOneAndUpdate(
        { _id: req.user.id },
        { $push: { liked: _id } },
        { new: true }
      );
      await user.save();
      console.log(post, user);
      const likes = post.likes;
      return res
        .status(200)
        .json({ status: 200, message: "Post liked", likes });
    }
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  all_posts,
  addPost,
  deletePost,
  signedUserPosts,
  userPosts,
  saved,
  liked,
};
