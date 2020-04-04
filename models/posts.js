const mongoose = require("mongoose");

const { projDb } = require("./db");
const config = require("../config");
const utils = require("../utils")

let postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ""
    },
    likes: {
      type: Number,
      default: 0
    },
    dislikes: {
      type: Number,
      default: 0
    },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: `${config.MODELS.user}`
      }
    ],
    dislikedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: `${config.MODELS.user}`
      }
    ],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: `${config.MODELS.user}`,
      required: true
    }
  },
  { timestamps: true }
);

let commentSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: `${config.MODELS.post}`,
    required: true
  },
  description: {
    type: String,
    default: ""
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: `${config.MODELS.user}`,
    required: true
  }
});

postSchema.index({ title: 1 });
postSchema.index({ description: 1 });
commentSchema.index({ post: 1 });


postSchema.statics.getPaginatedResults = function (req, query={}) {
    return utils.getPaginatedResults(req, this.find(query))
}
commentSchema.query.getPaginatedResults = utils.getPaginatedResults

const Posts = projDb.model(config.MODELS.post, postSchema);
const Comments = projDb.model(config.MODELS.comment, commentSchema);

module.exports = {
  Posts,
  Comments
};
