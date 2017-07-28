// var express = require("express");
// 
// var webpack = require("webpack");

import * as express   from "express";
import * as auth      from "./auth/auth";

import { serverRenderHandler }      from "./render/handleRender";
import { serverRegionHandler } from './middleWare/regeionHandler';

const { resolve } = require("path");
const pug         = require('pug');

const https       = require('https');
const fs          = require('fs');

let template      = require("./../pug/views/index.pug");
let app           = express();

app.use(express.static(resolve(process.cwd(), './public')));

app.use(auth.authHandler());

app.use(
  (req: any, res: any, next: any) => {
    // introduce a new variable on the request object for the start time of this request
    req.RequestStart = Date.now();
    next();
  });

app.get('/', serverRegionHandler());


app.use(serverRenderHandler());


const options = {
    key: fs.readFileSync(require('./../resources/certs/key.pem')),
    cert: fs.readFileSync(require('./../resources/certs/cert.pem'))
};

https.createServer(options, app)
    .listen(3000, function () {
        console.log("Listening on port 3000! \n ->please access it in https way.");
    })