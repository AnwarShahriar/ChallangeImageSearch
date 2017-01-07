var express = require("express");
var request = require("request");
var URL = require("url");
var app = express();

var PORT = process.env.PORT || 8080;

app.get('/api/imagesearch/*', function (req, res) {
    res.send(URL.parse(req.url));
});

app.listen(PORT, function () {
    console.log('Server is listening on port: ' + PORT);
});