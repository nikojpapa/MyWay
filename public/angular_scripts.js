var app = angular.module('myWay', []);

app.directive('username', function($q) {
    return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            ctrl.$asyncValidators.username = function(value) {
                // value is the username input
                var def = $q.defer();

                // NEED MORE WORK HERE to see if username is already taken
                /*
                if () {
                    // The username is available
                    def.resolve();
                } else {
                    // The username is taken
                    def.reject();
                }
                */
                scope.formFields.user = value;
                return def.promise;
            };
        }
    };
});

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
            - nav can be assigned: navigation.html (if user is not logged in), navigation-user.html (if user is logged in)
            - main can be assigned:
                homepage.html,
                login.html,
                login-success.html,
                register.html,
                register-success.html,
                search.html,
                profile.html,
                user-groups.html,
                logout-success.html
        - $scope.display contains all other html for displaying the page:
            - searchResults
        - $scope.formFields contains all form inputs:
            - location
            - category
            - minPrice
            - maxPrice
            - startDate
            - endDate
            - email
            - user
            - password
        - $scope.user contains user information
            - username
     */
    $scope.templates = {};
    $scope.templates.nav = "./templates/navigation.html";
    $scope.templates.main = "./templates/homepage.html";
    $scope.display = {};
    $scope.formFields = {};
    $scope.user = {};

    // Define event handler functions
    $scope.toHomepage = function() {
        $scope.templates.main = "./templates/homepage.html";
        $scope.display = {};
        $scope.formFields = {};
    };

    $scope.toSearch = function() {
        $scope.templates.main = "./templates/search.html";

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
                            + "</p></a></div>";
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

    $scope.toSignUp = function() {
        $scope.templates.main = "./templates/register.html";
    };

    $scope.newUser = function() {
        // NEED MORE WORK HERE to add user to database
        var success = true;
        if (success){
            $scope.user.username = angular.copy($scope.formFields.user);
            $scope.templates.nav = "./templates/navigation-user.html";
            $scope.templates.main = "./templates/register-success.html";
        }
        else{
            $scope.display.errorMessage = "<div class='alert alert-danger'><strong>Registration failed!</strong> Please try again later.</div>";
            $scope.display.errorMessage = $sce.trustAsHtml($scope.display.errorMessage);
        }
    };

    $scope.toLogIn = function() {
        $scope.templates.main = "./templates/login.html";
    };

    $scope.loginUser = function() {
        // NEED MORE WORK HERE to check if email/password is correct
        var user = "USER";      // Should be replaced with the actual username
        var success = true;
        if (success){
            $scope.user.username = user;
            $scope.templates.nav = "./templates/navigation-user.html";
            $scope.templates.main = "./templates/login-success.html";
        }
        else{
            $scope.display.errorMessage = "<div class='alert alert-danger'><strong>Incorrect email/password combination!</strong></div>";
            $scope.display.errorMessage = $sce.trustAsHtml($scope.display.errorMessage);
        }
    };
    
    $scope.toEditProfile = function() {

    };

    $scope.toViewMyGroups = function() {

    };

    $scope.toLogOut = function() {
        $scope.user = {};
        $scope.display = {};
        $scope.formFields = {};
        $scope.templates.nav = "./templates/navigation.html";
        $scope.templates.main = "./templates/logout-success.html";
    };

    $scope.toFilter = function() {

    };

    $scope.toJoin = function(dealuid) {

    };
    
});

$(document).ready(function() {
    $("body").tooltip({ selector: '[data-toggle=tooltip]' });
});