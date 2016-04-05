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
    if (location_field) {

        //need to check to see if our search term is already in the database. If so, don't make api call and instead render json object from db
        MongoClient.connect(url, function (err, db) {
            if (err) {
                return console.dir(err);
            }

            var collection = db.collection('test');
            var searchTerm = location_field.toString();

            console.log('CHECKING FOR A CACHED RESULT ON SEARCH TERM: ' + searchTerm);
            var previouslyFound = collection.find({'searchTerm': searchTerm});
            var finalResult = {};
            if (previouslyFound) {
                // res.render('index', {title: 'MyWay', location: location_field, resultJSON: previouslyFound['cachedResults']});
                console.log('PREVIOUS RESULT FOUND');
                
                finalResult = previouslyFound['cachedResults'];
            }

            else {

                var query = "https://partner-api.groupon.com/deals.json?tsToken=US_AFF_0_201236_212556_0&limit=10&division_id=" + location_field;
                // Using request module to pass results
                request(query, function (err, resp, body) {
                    var results = JSON.parse(body);
                    finalResult = results;

                    if (results.error) {
                        res.render('index', {title: 'MyWay', location: location_field, message: results.error.message});
                    }

                    else {
                        MongoClient.connect(url, function (err, db) {

                            if (err) {
                                return console.dir(err);
                            }

                            var searchTerm = location_field.toString();
                            console.log('SEARCH TERM: ' + searchTerm);
                            var cachedResults = {'searchTerm': searchTerm, 'cachedResults': results};
                            // cachedResults[s]= results;
                            var lotsOfDocs = [{'hello': 'doc3'}, {'hello': 'doc4'}];

                            // collection.insert(cachedResults);
                            // collection.update({'searchTerm': searchTerm}, {$set: {'cachedResults': results}}, {w: 1}, function (err, result) {
                            //     console.log('ERROR: ' + err);
                            collection.insert(cachedResults);
                        });
                    }
                });
            }

            res.render('index', {title: 'MyWay', location: location_field, resultJSON: finalResult});
        });
    } else {
        // else the location field has not been filled
        res.render('index', { title: 'MyWay'});
    }
});

module.exports = router;
