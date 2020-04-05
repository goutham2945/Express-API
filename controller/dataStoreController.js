// Node imports
const fs = require("fs");

// Node 3rd party imports
const MongoClient = require("mongodb").MongoClient;
const csv = require("csv-parser");
const json2csv = require("json2csv").parse;
const Json2csvStream = require("json2csv-stream");

// Node custom imports
const config = require("../config");

let db;
MongoClient.connect(config.MONGO_URI, { useUnifiedTopology: true }, function (err,database) {
  if (err) console.log(err);
  db = database.db(`${config.DATASTORE_DB}`);
});

const bulkUpload = async (req, resp, next) => {
  try {
        const csvResults = [];
        const csvOptions = {
        mapHeaders: ({ header, index }) => header.toLowerCase(), // optional
        mapValues: ({ header, index, value }) => value.toLowerCase(), // optional
        separator: ",", // optional default `,`
        skip_lines_with_error: true, // optional
        columns: true, // default true, optional ['name', 'age']
        };

        if (!req.body.tableName || !/^[a-z]+$/g.test(req.body.tableName)) {
        throw new Error("Invalid tableName format found / no tableName");
        }

        fs.createReadStream(req.file.path)
            .on("error", (err) => next(err))
            .pipe(csv(csvOptions))
            .on("headers", (headers) => headers)
            .on("data", (row) => csvResults.push(row))
            .on("end", () => {
                db.collection(`${req.user._id}_${req.body.tableName}`).insertMany(csvResults).then((records) => {
                    fs.unlinkSync(req.file.path);
                    let { result, insertedCount } = records;
                    resp.push(true, "Succesfully inserted", { result, insertedCount });
                });
            })
            .on("error", (err) => next(err));
  } catch (err) {
    next(err);
  }
};

const downloadTable = async (req, resp, next) => {
  try {
        const collName = `${req.user._id}_${req.params.tbName}`;
        db.listCollections().toArray((err, colls) => {
            const colExits = colls.find((ele) => ele.name === collName);
            if (!colExits) resp.status(500).push(false, "No table exists", null);
            db.collection(collName).find({}, { fields: { _id: 0 } }).toArray((err, docs) => {
                if (err) next(err);
                if (!docs.length) resp.push(500).push(false, "No data found", []);
                const csvString = json2csv(docs);
                resp.setHeader(
                    "Content-disposition",
                    `attachment; filename=${req.params.tbName || req.user._id}.csv`
                );
                resp.set("Content-Type", "text/csv");
                resp.send(csvString);
                });
        });
  } catch (err) {
    next(err);
  }
};

const streamTableData = async (req, resp, next) => {
  try {
    const collName = `${req.user._id}_${req.params.tbName}`;
    db.listCollections().toArray((err, colls) => {
        const colExits = colls.find((ele) => ele.name === collName);
        if (!colExits) resp.status(500).push(false, "No table exists", null);
        const headers = {
            "Content-Type": "text/csv",
            "Content-disposition": "attachment;filename=" + `${req.params.tbName || req.user._id || new Date().getTime()}.csv`,
        };
        resp.writeHead(200, headers);
        var mongoStream = db.collection(collName).find({}).stream({ transform: JSON.stringify });
        const parser = new Json2csvStream();
        mongoStream.pipe(parser).pipe(resp);
    })
  } catch (err) {
      next(err)
  }
};

module.exports = {
  bulkUpload,
  downloadTable,
  streamTableData,
};
