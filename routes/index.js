var express = require('express');
var router = express.Router();

/* Functions */
function searchQuery(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

function searchResults(results) {
	results= JSON.parse(results)
	// results_area= document.getElementById("search_results")
	console.log("searchResults")
}

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log("home")
  res.render('index', { title: 'MyWay2' });
  searchQuery("https://partner-api.groupon.com/deals.json?tsToken=US_AFF_0_201236_212556_0&limit=50", searchResults())
});

module.exports = router;
