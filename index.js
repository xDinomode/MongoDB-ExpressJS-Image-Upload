"use strict";


var express = require("express");
var app = express();

var fs = require("fs");

var multer = require("multer");
var upload = multer({dest: "./uploads"});

var mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/images");
var conn = mongoose.connection;

var gfs;

var Grid = require("gridfs-stream");
Grid.mongo = mongoose.mongo;

conn.once("open", function(){
  gfs = Grid(conn.db);
});

app.set("view engine", "ejs");
app.set("views", "./views");

app.get("/", function(req,res){
  //renders a multipart/form-data form
  res.render("home");
});

//second parameter is multer middleware.
app.post("/", upload.single("avatar"), function(req, res, next){

  //create a gridfs-stream into which we pipe multer's temporary file saved in uploads. After which we delete multer's temp file.
  var writestream = gfs.createWriteStream({
    filename: req.file.originalname,
  });

  //pipe multer's temp file /uploads/filename into the stream we created above. On end deletes the temporary file.
  fs.createReadStream("./uploads/" + req.file.filename)
    .on("end", function(){fs.unlink("./uploads/"+ req.file.filename, function(err){res.send("success")})})
      .on("err", function(){res.send("error")})
        .pipe(writestream);
});

//sends the image we saved by filename.
app.get("/:filename", function(req, res){
  gfs.createReadStream({filename: req.params.filename})
    .pipe(res);
});

if (!module.parent) {
  app.listen(3000);
}
