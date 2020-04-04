// node imports
const path = require("path");

// node 3rd party imports
const express = require("express");
const router = express.Router();

// Cutom imports
const postController = require("../controller/postController");
const { loginRequired, checkPermissions } = require("../middleware/middleware");

// post routes
// TODO: filter post based on id and user
router.get("/", postController.getAllPosts);
router.get("/:id", postController.getPost);
router.post("/create", postController.createPost);
router.post("/edit/:id", postController.editPost);
router.delete("/delete/:id", postController.deletePost);
router.post("/reactions/:id", loginRequired, postController.updateReaction);

// comment routes
router.get("/:id/comments", postController.getAllComments);
router.post("/:id/comments", postController.createComment);
router.delete("/:postId/comments/:cmntId", postController.deleteComment);

module.exports = router;


