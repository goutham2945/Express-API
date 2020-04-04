const path = require("path");
const JWT = require("jsonwebtoken");

const config = require("../config");
const { Posts, Comments } = require("../models/posts");

const createPost = async (req, resp) => {
  try {
    req.body.owner = req.user;
    const post = new Posts(req.body);
    await post.save();
    resp.push(true, "Post created successfully", post);
  } catch (err) {
    resp.status(404).push(false, err.message, null);
  }
};

const editPost = async (req, resp) => {
  try {
    const post = await Posts.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true, upsert: true, rawResult: true }
    );
    resp.push(true, "Updated sucess", post);
  } catch (err) {
    resp.status(404).push(false, err.message, null);
  }
};

const updateReaction = async (req, resp) => {
  try {
    let postId = req.params.id;
    let reactionTypes = ["LIKE", "DISLIKE", "LOVE"];
    let { reactionType: rT } = req.body;
    if (!(rT && reactionTypes.includes(rT)))throw new Error(`Expected param :reactionType:  ['LIKE', 'DISLIKE', 'LOVE']`);
    let post = await Posts.findById(postId)
      .populate("likedBy")
      .populate("dislikedBy")
      .exec();
    if (!post) throw new Error("Post id not found");
    let userLiked = post.likedBy.findIndex(ele => ele._id.toString() === req.user._id.toString());
    let userDisliked = post.dislikedBy.findIndex(ele => ele._id.toString() === req.user._id.toString());
    if (userLiked != -1 && rT == "LIKE")throw new Error("Operation not allowed : User already had liked");
    if (userDisliked != -1 && rT == "DISLIKE")throw new Error("Operation not allowed : User already had Disliked the post");

    switch (rT) {
      case "LIKE":
        if (userDisliked != -1) {
          post.dislikes -= 1;
          post.dislikedBy.splice(userDisliked, 1);
        }
        post.likes += 1;
        post.likedBy.push(req.user);
        break;
      case "DISLIKE":
        if (userLiked != -1) {
          post.likes -= 1;
          post.likedBy.splice(userLiked, 1);
        }
        post.dislikes += 1;
        post.dislikedBy.push(req.user);
        break;
    }
    await post.save();
    resp.push(true, "Reaction updated success", post);
  } catch (err) {
    resp.status(404).push(false, err.message, null);
  }
};

const deletePost = async (req, resp) => {
  try {
    let post = await Posts.findByIdAndDelete(req.params.id, {
      rawResult: true
    });
    if (!post.value) throw new Error("Post not found");
    resp.push(true, "Post deleted successfully", post);
  } catch (err) {
    resp.status(404).push(false, err.message, null);
  }
};

const getPost = async (req, resp) => {
  try {
    let post = await Posts.findById(req.params.id);
    if (!post) throw new Error("Post not found");
    resp.push(true, "Post found successfully", post);
  } catch (err) {
    resp.status(404).push(false, err.message, null);
  }
};

const getAllPosts = async (req, resp) => {
  try {
    let posts = await Posts.getPaginatedResults(req)
    resp.push(true, "Posts found successfully", posts);
  } catch (err) {
    resp.status(404).push(false, err.message, null);
  }
};

const createComment = async (req, resp) => {
  try {
    let post = await Posts.findById(req.params.id);
    if (!post) throw new Error("Post not found");
    req.body.owner = req.user;
    req.body.post = post._id;
    let comment = new Comments(req.body);
    await comment.save();
    resp.push(true, `Success`, comment);
  } catch (err) {
    resp.status(404).push(false, err.message, null);
  }
};

const getAllComments = async (req, resp) => {
  try {
    let comments = await Comments.find({
      owner: req.user._id,
      post: req.params.id
    }).getPaginatedResults(req);
    resp.push(true, "Comments found successfully", comments);
  } catch (err) {
    resp.status(404).push(false, err.message, null);
  }
};

const deleteComment = async (req, resp) => {
  try {
    let comment = await Comments.findOneAndDelete(
      { post: req.params.postId, _id: req.params.cmntId, owner: req.user._id },
      { rawResult: true }
    ).exec();
    if (!comment.value) throw new Error("Comment not found");
    resp.push(true, "Comment deleted successfully", comment);
  } catch (err) {
    resp.status(404).push(false, err.message, null);
  }
};

module.exports = {
  createPost,
  editPost,
  updateReaction,
  deletePost,
  getPost,
  getAllPosts,

  createComment,
  getAllComments,
  deleteComment
};
