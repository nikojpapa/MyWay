var express = require('express');
var router = express.Router();
var request = require('request');

/* Functions */
/*
function searchQuery(queryUrl)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            return JSON.parse(xmlhttp.responseText);
        }
        else {
            return null;
        }
    };

    xmlHttp.open("GET", queryUrl, false); // true for asynchronous
    xmlHttp.send(null);
}
*/

/* GET home page. */
router.get('/', function(req, res, next) {
    var location_field = req.param('location');
    if (location_field)
    {
        // if the location field has been filled
        // Do a search based on the location
        var query = "https://partner-api.groupon.com/deals.json?tsToken=US_AFF_0_201236_212556_0&limit=10&division_name=" + location_field;
        // Using request module to pass results
        request(query, function(err, resp, body) {
            var results = JSON.parse(body);
            console.log(results);
            res.render('index', { title: 'MyWay', location: location_field, resultJSON: results});
        });
    }
    else
    {
        // else the location field has not been filled
        res.render('index', { title: 'MyWay'});
    }
});

module.exports = router;
