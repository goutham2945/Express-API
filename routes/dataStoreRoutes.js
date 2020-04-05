// node imports
const path = require("path");

// node 3rd party imports
const express = require("express");
const router = express.Router();
const multer = require("multer");

// Cutom imports
const storeController = require("../controller/dataStoreController");
const config = require("../config");

// middlewares
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../uploads/tmp/"));
    },
    filename: function (req, file, cb) {
        // Note if you are using this middleware with out even creating user, if any error in body/uniqness will create file but not user so be careful
        let ext = path.extname(file.originalname);
        let newFileName = `${new Date().getTime()}${ext}`;
        req.avatar = newFileName;
        cb(null, newFileName);
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === "text/csv") {
        cb(null, true);
    } else {
        cb(new Error('Invalid file formats expecting csv'), false)
    }
};
const dsUpload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * config.DS_FILE_MAX_SIZE,// optional
    },
    fileFilter: fileFilter, // optional
});

// post routes
router.post("/bulk-upload", dsUpload.single("table"), storeController.bulkUpload);
router.get("/download-table/:tbName", storeController.downloadTable); // below and this works ways the same but below one is streaming data which is effiecient
router.get("/export-table/:tbName", storeController.streamTableData); // its working but sometimes thoruwing Cannot set headers after they are sent to the client
module.exports = router;
