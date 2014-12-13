var app = angular.module('therapist', ['ui.router','ui.bootstrap', 'ui.bootstrap.tpls','ParseServices', 'parse-angular']).
//','parse-angular.enhance'
config(function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('/',{
      url: '/',
      templateUrl: "therapist.html"
    })
    .state('patients', {
      url: "/patients",
      templateUrl: "partials/patients.html"
    })
    .state('assignExcercises', {
      url: "/assignExcercises",
      templateUrl: "partials/assignExcercises.html"
    });
})
.run(['ParseSDK', function(ParseService){

}]);