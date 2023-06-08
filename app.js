const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const multer = require("multer");
const AWS = require("aws-sdk");

//aws config

const awsConfig = {
  accessKeyId: process.env.AccessKey,
  secretAccessKey: process.env.SecretKey,
  region: process.env.region,
};

const S3 = new AWS.S3(awsConfig);

const Port = 7500;
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// multer config
let upload = multer();

const uploadtos3 = (filedata, name) => {
  console.log("filedata", filedata);
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: process.env.bucketName,
      Key: name,
      Body: filedata,
    };
    S3.upload(params, (err, data) => {
      if (err) {
        console.log(err);
        reject(err);
      }
      console.log("data", data);
      return resolve(data);
    });
  });
};

app.post("/upload-file", upload.single("file"), (req, res) => {
  console.log(req.file);
  if (req.file) {
    uploadtos3(req.file.buffer, req.file.originalname)
      .then((result) => {
        return res.json({
          message: "succesfully uploaded",
          data: result,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }
});

app.post("/upload-multi", upload.array("files", 5), (req, res) => {
  console.log("multi file", req.files);
  if (req.files && req.files.length > 0) {
    for (let i = 0; i < req.files.length; i++) {
      uploadtos3(req.files[i].buffer, req.files[i].originalname).then(
        (result) => {
          console.log("result", result);
        }
      );
    }
  }
  return res.json({ message: "uploaded", result: req.files.length });
});

app.listen(Port, () => {
  console.log("server started");
});
