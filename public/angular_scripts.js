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
                            $scope.display.searchResults += "<button class='btn btn-info center-block' ng-click=\"toJoin(\'"+ deal.uuid.toString() +"\')\"><span class='glyphicon glyphicon-plus'></span> Join Group</button></div></div>";
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

    $scope.toJoin = function(dealuid) {

    };
    
});

$(document).ready(function() {
    $("body").tooltip({ selector: '[data-toggle=tooltip]' });
});