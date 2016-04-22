var express = require('express');
var router = express.Router();
var request = require('request');

var MongoClient = require('mongodb').MongoClient,
    test = require('assert');
// Connection url
var url = 'mongodb://localhost:27017/TestLocalHost';

/* Functions */

/* api routing */
router.get('/api', function(req, res, next) {
    var location_field = req.param('location');
    var catetory = req.param('category');

    if (location_field && catetory){
        var searchTerm = location_field.toString().replace(/\s+/g, '-').toLowerCase();
        // Do a search based on the location and category
        var query =
            "https://partner-api.groupon.com/deals.json?tsToken=US_AFF_0_201236_212556_0&limit=150&division_id="
            + searchTerm
            + "&filters=category:"
            + catetory.toString().toLowerCase();
        // Using request module to pass results
        request(query, function (err, resp, body) {
            var results = JSON.parse(body);
            if (results.error) {
                return res.json({message: results.error.message});
            }
            else {
                // Limit results to only group deals
                var finalResults = {};
                finalResults.deals = [];
                var total = results.deals.length;
                for(var i=0;i<total;i++) {
                    var deal = results.deals[i];
                    var numOptions = deal.options.length;
                    for(var j=0;j<numOptions;j++) {
                        var title = deal.options[j].title.toLowerCase();
                        if ((title.indexOf("for two") > -1) || (title.indexOf("for four") > -1)){
                            finalResults.deals.push(deal);
                            break;
                        }
                    }
                }
                // console.log(finalResults);
                if (finalResults.deals.length == 0){
                    return res.json({message: "Deal Not found"});
                }
                else {
                    return res.json({resultJSON: finalResults});
                }
            }
        });

    }
    else if (location_field) {
        //need to check to see if our search term is already in the database. If so, don't make api call.
        MongoClient.connect(url, function (err, db) {
            if (err) {
                // db.close();
                return res.json({message: "Unable to connect to database"});
            }
            var collection = db.collection('deals_db');
            var searchTerm = location_field.toString().replace(/\s+/g, '-').toLowerCase();

            collection.findOne({'searchTerm': searchTerm}, function (err, doc) {
                // console.log(doc); //prints json object for test purposes
                var testResult = doc;
                if (testResult == null) {
                    console.log("Entry not found in database, performing API call...");
                    // Do a search based on the location
                    var query = "https://partner-api.groupon.com/deals.json?tsToken=US_AFF_0_201236_212556_0&limit=100&division_id=" + searchTerm;
                    // Using request module to pass results
                    request(query, function (err, resp, body) {
                        var results = JSON.parse(body);
                        if (results.error) {
                            db.close();
                            return res.json({message: results.error.message});
                        }
                        else {
                            // Limit results to only group deals
                            var finalResults = {};
                            finalResults.deals = [];
                            var total = results.deals.length;
                            for(var i=0;i<total;i++) {
                                var deal = results.deals[i];
                                var numOptions = deal.options.length;
                                for(var j=0;j<numOptions;j++) {
                                    var title = deal.options[j].title.toLowerCase();
                                    if ((title.indexOf("for two") > -1) || (title.indexOf("for four") > -1)){
                                        finalResults.deals.push(deal);
                                        break;
                                    }
                                }
                            }
                            // console.log(finalResults);
                            if (finalResults.deals.length == 0){
                                db.close();
                                return res.json({message: "Deal Not found"});
                            }
                            else {
                                var cachedResults = {'searchTerm': searchTerm, 'cachedResults': finalResults};
                                collection.insert(cachedResults);
                                console.log('connected, new document inserted');
                                db.close();
                                return res.json({resultJSON: finalResults});
                            }
                        }
                    });
                }

                if (testResult != null) {
                    console.log("Entry already found in database");
                    var finalResults = testResult.cachedResults;
                    db.close();
                    return res.json({resultJSON: finalResults});
                }
            });
        });
    }
});

/* add to group */
router.get('/addToGroup', function(req, res, next) {
    var userid = req.param('userid');
    var dealid = req.param('dealid');

    MongoClient.connect(url, function (err, db) {
        if (err) {
            // db.close();
            return res.json({result: "error"});
        }
        console.log("addToGroup");
        var collection = db.collection('groups_db');
        collection.findOne({'dealid': dealid}, function (err, doc) {
            // console.log(doc); //prints json object for test purposes
            var testResult = doc;
            if (testResult == null) {
                console.log("Adding user " + userid + " to group " + dealid);
                var newUser= {'dealid': dealid, 'userids': [userid]};
                collection.insert(newUser);
                db.close();
                return res.json({result: "success"});
            }

            if (testResult != null) {
                var oldUsers= doc['userids'];
                if (oldUsers.indexOf(userid) > -1) {
                    console.log(userid + " already in group " + dealid);
                    db.close();
                    return res.json({result: "existed"});
                } else {
                    console.log("Adding user " + userid + " to existing group " + dealid);
                    var newUsers = oldUsers;
                    newUsers[newUsers.length] = userid;
                    collection.update({'dealid': dealid}, {$set: {'userids': newUsers}});
                    db.close();
                    return res.json({result: "success"});
                }
            }
        });
    });
});

/* display group members */
router.get('/get_members', function(req, res, next) {
    var dealid= req.param('dealid');

    MongoClient.connect(url, function (err, db) {
        if (err) {
            // db.close();
            return res.json({message: "Unable to connect to database"});
        }
        console.log("get_members");
        var collection = db.collection('groups_db');
        collection.findOne({'dealid': dealid}, function (err, doc) {
            // console.log(doc); //prints json object for test purposes
            var testResult = doc;
            if (testResult != null) {
                console.log("Returning " + doc['userids'].length + " members from group " + dealid);
                db.close();
                return res.json({userids: doc['userids']});
            } else if (testResult == null) {
                console.log(dealid + " not found");
                db.close();
                return res.json({message: "No one has joined this group"});
            }
        });
    });
});

module.exports = router;

































