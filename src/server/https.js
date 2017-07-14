
let express = require('express');
let https = require('https');
const fs = require('fs');
const {resolve}       = require("path");


https.globalAgent.maxSockets = 10000;
let app = express();

/*
const options = {
    pfx: fs.readFileSync(resolve(__dirname, './../resources/certs/my_cert.pfx')),
    passphrase: 'password!123'
};
*/

const options = {
  key: fs.readFileSync(resolve(__dirname, './../resources/certs/key.pem')),
  cert: fs.readFileSync(resolve(__dirname, './../resources/certs/cert.pem'))
};



https.createServer(options, app)
    .listen(8000, function(){
        console.log("listening on port 8000!");
    })