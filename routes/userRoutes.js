// node imports
const path = require("path");

// node 3rd party imports
const express = require("express");
const router = express.Router();
const multer = require("multer");

// custom imports
const userController = require("../controller/userController");
const { loginRequired, checkPermissions } = require("../middleware/middleware");

// middlewares
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, "../uploads/users/"));
  },
  filename: function(req, file, cb) {
    // Note if you are using this middleware with out even creating user, if any error in body/uniqness will create file but not user so be careful
    let ext = path.extname(file.originalname)
    let newFileName = `${new Date().getTime()}${ext}`
    req.avatar = newFileName
    cb(null, newFileName);
  }
});

const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    // cb(new Error('Invalid file formats'), false) 
    cb(null, false); // if u need to bypass the req with out error use this else above
  }
};

const upload = multer({
  storage: storage,
  limits: {               // optional
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter, // optional
});

router.post("/signup", upload.single("avatar"), userController.signUp);
router.post("/signin", userController.signIn);
router.get("/", loginRequired, checkPermissions(["admin", "superadmin"]), userController.getUsers);

module.exports = router;
