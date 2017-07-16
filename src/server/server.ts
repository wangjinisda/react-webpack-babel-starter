// var express = require("express");
// 
// var webpack = require("webpack");
'use strict';

import * as express from "express";
const { resolve } = require("path");

const pug         = require('pug');
const https       = require('https');
const fs          = require('fs');

let template = require("./../jade/views/index.pug");
let app      = express();

app.use(express.static(resolve(process.cwd(), './public')));

app.use(
  (req: any, res: any, next: any) => {
    // introduce a new variable on the request object for the start time of this request
    req.RequestStart = Date.now();
    next();
  });

app.get('/', function (req, res) {

  res.send(template({
    name: 'test',
    title: 'jiwag title'
  }));
});


const options = {
    key: fs.readFileSync(require('./../resources/certs/key.pem')),
    cert: fs.readFileSync(require('./../resources/certs/cert.pem'))
};

https.createServer(options, app)
    .listen(3000, function () {
        console.log("Listening on port 3000! \n ->please access it in https way.");
    })