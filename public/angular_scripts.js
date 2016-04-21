var app = angular.module('myWay', []);

app.directive('display', function($compile, $parse) {
    return {
        restrict: 'E',
        link: function(scope, element, attr) {
            scope.$watch(attr.content, function() {
                element.html($parse(attr.content)(scope));
                $compile(element.contents())(scope);
            }, true);
        }
    }
});

app.controller('myWayCtrl', function($scope, $http, $sce) {
    /*
        Initialize scope variables
        - $scope.templates has two fields: nav (for displaying the navigation bar), main (for displaying the main content)
        - $scope.display contains all other html for displaying the page:
            - searchResults
        - $scope.formFields contains all form inputs:
            - location
            - category
     */
    $scope.templates = {};
    $scope.templates.nav = "./templates/navigation.html";
    $scope.templates.main = "./templates/homepage.html";
    $scope.display = {};
    $scope.user = {};
    $scope.formFields = {};

    // Define event handler functions
    $scope.toHomepage = function() {
        $scope.templates.main = "./templates/homepage.html";
        $scope.display = {};
        $scope.formFields = {};
    };

    $scope.toSearch = function() {
        $scope.templates.main = "./templates/search.html";
        $scope.formFields.category = undefined;
        $http.get('http://localhost:3000/api', {params: {location: $scope.formFields.location}})
            .then(function(response) {
                if (response.data.message){
                    $scope.display.searchResults = "<h3>"+response.data.message.toString()+"</h3>";
                }
                if (response.data.resultJSON){
                    var total = response.data.resultJSON.deals.length;
                    $scope.display.searchResults = "";
                    for(var i=0;i<total;i++) {
                        var deal = response.data.resultJSON.deals[i];
                        $scope.display.searchResults += "<div class='col-sm-6 col-md-4'><div ng-bind-html='display.errorMessage'></div><div class='thumbnail'><a target='_blank' href="
                            + deal.dealUrl.toString()
                            + "><img src="
                            + deal.grid4ImageUrl.toString()
                            + "></a><div class='caption'><a target='_blank' href="
                            + deal.dealUrl.toString()
                            + "><p>"
                            + deal.title.toString()
                            + "</p></a></div><div><p class='price'>"
                            + deal.options[0].price.formattedAmount
                            + "</p></div>";
                        if ($scope.user.username === undefined){
                            $scope.display.searchResults += "<button class='btn btn-info center-block disabled' data-toggle='tooltip' data-placement='right' title='Please login first'><span class='glyphicon glyphicon-plus'></span> Join Group</button></div></div>";
                        }
                        else{
                            $scope.display.searchResults += "<button class='btn btn-info center-block' ng-click=\"toJoin(\'"+ deal.uuid.toString() +"\')\"><span class='glyphicon glyphicon-plus'></span> Join Group</button><form action='group.html' method='get' target='_blank'><input type=\"hidden\" name='deal' value='"+ deal.uuid.toString() +"'><input class = 'view-button' type='submit' value='View'></form></div></div>";
                        }
                    }
                }
            });
    };

    $scope.toFilter = function() {
        if ($scope.formFields.category !== undefined){
            $http.get('http://localhost:3000/api', {params: {location: $scope.formFields.location, category: $scope.formFields.category}})
                .then(function(response) {
                    if (response.data.message){
                        $scope.display.searchResults = "<h3>"+response.data.message.toString()+"</h3>";
                    }
                    if (response.data.resultJSON){
                        var total = response.data.resultJSON.deals.length;
                        $scope.display.searchResults = "";
                        for(var i=0;i<total;i++) {
                            var deal = response.data.resultJSON.deals[i];
                            $scope.display.searchResults += "<div class='col-sm-6 col-md-4'><div ng-bind-html='display.errorMessage'></div><div class='thumbnail'><a target='_blank' href="
                                + deal.dealUrl.toString()
                                + "><img src="
                                + deal.grid4ImageUrl.toString()
                                + "></a><div class='caption'><a target='_blank' href="
                                + deal.dealUrl.toString()
                                + "><p>"
                                + deal.title.toString()
                                + "</p></a></div><div><p class='price'>"
                                + deal.options[0].price.formattedAmount
                                + "</p></div>";
                            if ($scope.user.username === undefined){
                                $scope.display.searchResults += "<button class='btn btn-info center-block disabled' data-toggle='tooltip' data-placement='right' title='Please login first'><span class='glyphicon glyphicon-plus'></span> Join Group</button></div></div>";
                            }
                            else{
                                $scope.display.searchResults += "<button class='btn btn-info center-block' ng-click=\"toJoin(\'"+ deal.uuid.toString() +"\')\"><span class='glyphicon glyphicon-plus'></span> Join Group</button></div></div>";
                            }
                        }
                    }
                });
        }
    };

    $scope.toJoin = function(dealid) {
        // Variables related to user: $scope.user.username, $scope.user.userid, $scope.user.email
        $http.get('http://localhost:3000/addToGroup', {params: {dealid: dealid, userid: $scope.user.userid}});
    };
    
});

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)", "i"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
};

app.controller('myWayGroupCtrl', function($scope, $http, $sce) {
    /*
     Initialize scope variables
     - $scope.display contains all other html for displaying the page:
        - group_members
     */
    $scope.display = {};
    var dealid = getParameterByName('deal', document.URL);
    if (dealid){
        $http.get('http://localhost:3000/get_members', {params: {dealid: dealid}})
            .then(function(response) {
                console.log("Response received from get_members");
                $scope.display.group_members = "<h3>"+response.toString()+"</h3>";
            });
    }
});


$(document).ready(function() {
    $("body").tooltip({ selector: '[data-toggle=tooltip]' });
});