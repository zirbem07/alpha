
angular.module('HCAlpha',
    [
        'ngTouch',
        'HCAlpha.controllers',
        'HCAlpha.services',
        'HCAlpha.directives',
        'angular-cardflow',
        'ui.router',
        'ui.bootstrap.dropdown',
        'ParseServices',
        'parse-angular',
        'ui.bootstrap',
        'ui.bootstrap.tpls'
    ])
.run(['ParseSDK', function(ParseService){

}])
.config(function($stateProvider, $urlRouterProvider) {


    $stateProvider
        .state('home', {
            url: '/home',
            templateUrl: 'views/home.html',
            controller: 'HomeCtrl'
        })
        .state('signUp', {
            url: '/signUp',
            templateUrl: 'views/signUp.html',
            controller: 'SignUpCtrl'
        })
        .state('therapist', {
            url: "/therapist",
            templateUrl: "views/therapistShell.html",
            controller: 'therapistCtrl'
        })
        .state('therapist.viewPatients', {
          url: "/patients",
          templateUrl: "views/viewPatients.html"
        })
        .state('therapist.managePatient', {
          url: "/managePatient",
          templateUrl: "views/managePatient.html",
          controller: 'patientManageCtrl'
        })
        .state('patient', {
            url: '/patient',
            templateUrl: 'views/patient.html',
            controller: 'PatientCtrl'
        });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/home');

});




