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

            var collection = db.collection('new');
            var searchTerm = location_field.toString();


            collection.findOne({'searchTerm': searchTerm}, function (err, doc) {
                // console.log(doc); //prints json object for test purposes
                var testResult = doc;
                if (testResult == null) {
                    console.log("Entry not found in database, performing API call...");
                    // if the location field has been filled
                    // Do a search based on the location
                    var query = "https://partner-api.groupon.com/deals.json?tsToken=US_AFF_0_201236_212556_0&limit=10&division_id=" + location_field;
                    // Using request module to pass results
                    request(query, function (err, resp, body) {
                        var results = JSON.parse(body);
                        var finalResults = results;
                        if (results.error) {
                            res.render('index', {title: 'MyWay', location: location_field, message: results.error.message});
                        }
                        else {
                                console.log('SEARCH TERM: ' + searchTerm);
                                var cachedResults = {'searchTerm': searchTerm, 'cachedResults': results};
                                collection.insert(cachedResults);
                                console.log('connected, new document inserted');
                            }

                            res.render('index', {title: 'MyWay', location: location_field, resultJSON: finalResults});
                        });


                }

                if (testResult != null) {
                    console.log("Entry already found in database");
                    //begin messing around
                    // var query = "https://partner-api.groupon.com/deals.json?tsToken=US_AFF_0_201236_212556_0&limit=10&division_id=" + location_field;
                    // request(query, function (err, resp, body) {
                    //     var results = JSON.parse(body);
                    //     var finalResults = results;
                    //
                    //
                    //
                    //     res.render('index', {title: 'MyWay', location: location_field, resultJSON: finalResults});
                    // });
                    //end
                    // var results = JSON.parse();
                    var finalResults = testResult.cachedResults;
                    res.render('index', {title: 'MyWay', location: location_field, resultJSON: finalResults});

                }

            });

        });

        }

    else
    {
        // else the location field has not been filled
        res.render('index', { title: 'MyWay'});
    }
});

module.exports = router;