const mongoose = require("mongoose");
const Promise = require("bluebird");
mongoose.Promise = Promise;
mongoose.set("useCreateIndex", true);

const config = require("../config");

const projDb = mongoose.createConnection(config.MONGO_URI, {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

module.exports = {
  projDb
};

/*
const mongoose = require("mongoose");
*/
/*
const Schema = mongoose.Schema;

const conn = mongoose.createConnection("mongodb://127.0.0.1:27017/users", {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

var userSchema = Schema({
  name: String,
  password: {
    type: String,
    default: "pass1234"
  },
  email: {
    type: String,
    default: "abc@gmal.com"
  }
});

var postsSchema = Schema({
  title: String,
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User"
  }
});

var likesSchema = Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: "Post"
  },
  likedBy: {
    type: Schema.Types.ObjectId,
    ref: "User"
  }
});
var userSchema1 = Schema({
  name: String
});
var teamSchema = Schema({
  name: {
    type: String,
    default: "Team"
  },
  players: [
    {
      type: Schema.Types.ObjectId,
      ref: "Newuser"
    }
  ]
});
const main = async () => {
  // Note it will not print nested objects on populating instead it will show [Object], so try destructing and print
  var User = conn.model("User", userSchema);
  var Posts = conn.model("Post", postsSchema);
  var Likes = conn.model("Like", likesSchema);

  const u1 = new User({ name: "goutham" });
  const u2 = new User({ name: "goutham2" });
  await u1.save();
  await u2.save();

  const p1 = new Posts({ title: "Post tiile 1", owner: u1._id });
  const p2 = new Posts({ title: "Post tiile 2", owner: u2._id });
  await p1.save();
  await p2.save();

  const l1 = new Likes({ likedBy: u1._id, post: p1._id, user: u1._id });
  const l2 = new Likes({ likedBy: u2._id, post: p1._id, user: u1._id });
  const l3 = new Likes({ likedBy: u2._id, post: p2._id, user: u1._id });
  await l1.save();
  await l2.save();
  await l3.save();

  const likes = await Likes.find({})
    .populate([
      { path: "likedBy", select: "-__v -_id" },
      { path: "post", select: "-__v -_id", populate: { path: "owner" } }
    ])
    .exec();

  console.log(likes[0].post.owner);

  await User.deleteMany({});
  await Posts.deleteMany({});
  await Likes.deleteMany({});

  //console.log(await Posts.find({}).exec())
var User = conn.model("Newuser", userSchema1);
var Team = conn.model("Team", teamSchema);

var U1 = new User({ name: "a" });
var U2 = new User({ name: "b" });

await U1.save();
await U2.save();

var t1 = new Team({ name: "A" });
await t1.save();

t1.players.push(U1);
t1.players.push(U1);

await t1.save();

var res = await Team.find({}).populate({ path: "players" });
console.log(res[0].players[0]);
await Team.deleteMany({});
};
main();
*/