// var express = require("express");
// 
// var webpack = require("webpack");
'use strict';

import * as express from "express";
const { resolve } = require("path");

const pug         = require('pug');

let template = require("./../jade/views/test.pug");
let app      = express();

app.use(express.static(resolve(process.cwd(), './public')));

app.use(
  (req: any, res: any, next: any) => {
    // introduce a new variable on the request object for the start time of this request
    req.RequestStart = Date.now();
    next();
  });



app.get('/', function (req, res) {

  res.send(template({name: 'test'}));
});


app.listen(3000, function () {
  console.log("Listening on port 3000!");
});