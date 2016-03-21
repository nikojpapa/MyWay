var express = require('express');
var router = express.Router();
var request = require('request');

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
