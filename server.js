var express = require("express");
var request = require("request");
var bodyParser = require("body-parser");
var mongodb = require("mongodb").MongoClient;
var URL = require("url");
var app = express();

var PORT = process.env.PORT || 8080;
var API_KEY = process.env.IMAGE_API_KEY;
var MONGO_URI = process.env.MONGO_URI;
var API_BASE_URL = 'https://api.cognitive.microsoft.com/bing/v5.0/images/search?count=10&q=';

app.use(bodyParser.urlencoded({ extended: false }));

app.get('/api/imagesearch/*', function (req, res) {
    var urlData = URL.parse(req.url);
    var searchTerm = urlData.pathname.split('/')[3] || '';
    var offset = req.query.offset || 0;
    
    saveQuery(searchTerm, function () {
        searchImage(searchTerm, offset, res);
    });
});

app.get('/api/latest/imagesearch', function (req, res) {
    mongodb.connect(MONGO_URI, function (err, db) {
        if (err) {
            console.error("Couldn't connect to database");
            return res.send([]);
        }
        
        db.collection('logs').find({}).toArray(function (err, docs) {
            if (err) return res.send([]);
            
            var data = docs.map(doc => {
                return {
                    term: doc.term,
                    when: doc.when
                };
            });
            
            res.send(data);
            
            db.close();
        });
    }); 
});

app.listen(PORT, function () {
    console.log('Server is listening on port: ' + PORT);
});

function saveQuery(query, callback) {
    var searchLog = {
        term: decodeURI(query),
        when: new Date().toISOString()
    };
    mongodb.connect(MONGO_URI, function (err, db) {
        if (err) {
            console.error("Couldn't connect to database");
            return callback();
        }
        
        db.collection('logs').insert(searchLog, function (err, result) {
            if (err) console.error("Couldn't insert the log");
            callback();
            db.close();
        });
    });
}

function searchImage(searchTerm, offset, res) {
    request({
        url: API_BASE_URL + searchTerm + (offset > 0 ? '&offset=' + offset : ''),
        headers: {
            'Ocp-Apim-Subscription-Key': API_KEY
        },
        json: true
    }, function (err, response, body) {
        if (err || response.statusCode != 200) return res.send([]);
        var images = body.value.map(image => {
            return {
                url: image.contentUrl,
                snippet: image.name,
                thumbnail: image.thumbnailUrl,
                context: 'http://' + image.hostPageDisplayUrl
            };
        });
        res.send(images);
    });
}