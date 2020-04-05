module.exports = {
  JWT_SECRET: "test_secret",
  JWT_EXPIRY_TIME: 60*60*60,
  MONGO_URI: "mongodb://127.0.0.1:27017/project",
  AVATARS_PATH: "http://localhost:3000/uploads/users/",
  MODELS: {
    user: "User",
    post: "Post",
    comment: "Comment"
  },
  DEF_PER_PAGE_COUNT: 10,
  DATASTORE_DB: "datastore",
  DS_FILE_MAX_SIZE: 10
};
