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
        - $scope.user contains user information:
            - userid
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
                else if (response.data.resultJSON){
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
                        if ($scope.user.userid === undefined){
                            $scope.display.searchResults += "<button class='btn btn-info center-block disabled' data-toggle='tooltip' data-placement='right' title='Please login first'><span class='glyphicon glyphicon-plus'></span> Join Group</button></div></div>";
                        }
                        else{
                            $scope.display.searchResults += "<button class='btn btn-info center-block' ng-click=\"toJoin(\'"+ deal.uuid.toString() +"\')\"><span class='glyphicon glyphicon-plus'></span> Join Group</button><form action='group.html' method='get' target='_blank'><input type=\"hidden\" name='deal' value='"+ deal.uuid.toString() +"'><input class = 'view-button' type='submit' value='View'></form></div></div>";
                        }
                    }
                    $scope.display.searchResults += "<h1 id='join-success-message'>You've been added successfully</h1><h1 id='join-existed-message'>You already joined this group</h1><h1 id='join-error-message'>Failed to connect to database</h1>";
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
                            if ($scope.user.userid === undefined){
                                $scope.display.searchResults += "<button class='btn btn-info center-block disabled' data-toggle='tooltip' data-placement='right' title='Please login first'><span class='glyphicon glyphicon-plus'></span> Join Group</button></div></div>";
                            }
                            else{
                                $scope.display.searchResults += "<button class='btn btn-info center-block' ng-click=\"toJoin(\'"+ deal.uuid.toString() +"\')\"><span class='glyphicon glyphicon-plus'></span> Join Group</button></div></div>";
                            }
                        }
                        $scope.display.searchResults += "<h1 id='join-success-message'>You've been added successfully</h1><h1 id='join-existed-message'>You already joined this group</h1><h1 id='join-error-message'>Failed to connect to database</h1>";
                    }
                });
        }
    };

    $scope.toJoin = function(dealid) {
        // Variables related to user: $scope.user.userid
        $http.get('http://localhost:3000/addToGroup', {params: {dealid: dealid, userid: $scope.user.userid, name: $scope.user.name}})
            .then(function(response) {
                if (response.data.result.toString() == "success"){
                    $("#join-success-message").show();
                    window.setTimeout(function () {
                        $("#join-success-message").slideUp(400, function () {
                            $("#join-success-message").hide();
                        });
                    }, 2000);
                }
                else if (response.data.result.toString() == "existed"){
                    $("#join-existed-message").show();
                    window.setTimeout(function () {
                        $("#join-existed-message").slideUp(400, function () {
                            $("#join-existed-message").hide();
                        });
                    }, 2000);
                }
                else if (response.data.result.toString() == "error"){
                    $("#join-error-message").show();
                    window.setTimeout(function () {
                        $("#join-error-message").slideUp(400, function () {
                            $("#join-error-message").hide();
                        });
                    }, 2000);
                }
            });
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
     - $scope.templates contains: nav (for displaying the navigation bar)
     - $scope.display contains all other html for displaying the page:
        - group_members
     - $scope.user contains user information:
        - userid
    */
    $scope.templates = {};
    $scope.templates.nav = "./templates/navigation-clean.html";
    $scope.display = {};
    $scope.user = {};
    var dealid = getParameterByName('deal', document.URL);
    if (dealid){
        $http.get('http://localhost:3000/get_members', {params: {dealid: dealid}})
            .then(function(response) {
                if (response.data.message){
                    $scope.display.group_members = "<div class='container'><div class='page-header'><h2>"+response.data.message.toString()+"</h2></div></div>";
                }
                else if (response.data.members) {
                    var total = response.data.members.length;
                    $scope.display.group_members = "<div class='container'><div class='page-header'><h2>Group Members</h2></div>";
                    for(var i=0;i<total;i++) {
                        var member = response.data.members[i];
                        $scope.display.group_members += "<a href=\"profile.html?user=" + member.uid + "\" target='_blank' role = 'button' class='btn btn-primary btn-lg'><span class='glyphicon glyphicon-user'>"+member.name+"</span></a>&nbsp;&nbsp;";
                    }
                    $scope.display.group_members += "</div>";
                }
            });
    }
});

app.controller('myWayProfileCtrl', function($scope, $http, $sce) {
    /*
     Initialize scope variables
     - $scope.templates contains: nav (for displaying the navigation bar)
     - $scope.profile contains profile information
        - profile_info
     - $scope.user contains user information:
        - userid
     */
    $scope.templates = {};
    $scope.templates.nav = "./templates/navigation-clean.html";
    $scope.profile = {};
    $scope.user = {};
    var user_id = getParameterByName('user', document.URL);
    if (user_id){
        $scope.profile.name = "John Smith";
        $scope.profile.email = "js@bu.edu";
        $scope.profile.age = "30";
        $scope.profile.gender = "male";
        $scope.profile.interests = "none";
        document.getElementById('profile-info').style.display = "block";
    }
    else {
        document.getElementById('profile-info').style.display = "none";
    }

});

$(document).ready(function() {
    $("body").tooltip({ selector: '[data-toggle=tooltip]' });
});