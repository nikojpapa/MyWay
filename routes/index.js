var express = require('express');
var router = express.Router();
var request = require('request');

var MongoClient = require('mongodb').MongoClient,
    test = require('assert');
// Connection url
var url = 'mongodb://localhost:27017/TestLocalHost';

/* Functions */

/* GET home page. */
router.get('/', function(req, res, next) {
    var location_field = req.param('location');
    if (location_field)
    {
        // if the location field has been filled
        // Do a search based on the location
        var query = "https://partner-api.groupon.com/deals.json?tsToken=US_AFF_0_201236_212556_0&limit=10&division_id=" + location_field;
        // Using request module to pass results
        request(query, function(err, resp, body) {
            var results = JSON.parse(body);
            if (results.error) {
                res.render('index', { title: 'MyWay', location: location_field, message: results.error.message});
            }
            else {
                MongoClient.connect(url, function(err, db) {

                    if(err) { return console.dir(err); }

                    var collection = db.collection('test');
                    var doc1 = {'hello':'doc1'};
                    var doc2 = {'hello':'doc2'};
                    var searchTerm= location_field.toString();
                    
                    var cachedResults = {searchTerm: results};
                    var lotsOfDocs = [{'hello':'doc3'}, {'hello':'doc4'}];

                    collection.insert(cachedResults);

                    // collection.insert(doc2, {w:1}, function(err, result) {});
                    //
                    // collection.insert(lotsOfDocs, {w:1}, function(err, result) {});

                    // Get an additional db
                    // db.createCollection('test', {strict:true}, function(err, collection) {});
                    // console.log('connected');
                    db.close();
                });

                res.render('index', { title: 'MyWay', location: location_field, resultJSON: results});
            }

        });
    }
    else
    {
        // else the location field has not been filled
        res.render('index', { title: 'MyWay'});
    }
});

module.exports = router;
