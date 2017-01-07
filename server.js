var express = require("express");
var request = require("request");
var bodyParser = require("body-parser");
var URL = require("url");
var app = express();

var PORT = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({ extended: false }));

app.get('/api/imagesearch/*', function (req, res) {
    res.send({offset: req.query.offset});
});

app.listen(PORT, function () {
    console.log('Server is listening on port: ' + PORT);
});