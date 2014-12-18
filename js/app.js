
angular.module('HCAlpha',
  [
    'ngTouch',
      'ngAnimate',
      'ngMaterial',
    'HCAlpha.controllers',
    'HCAlpha.services',
    'HCAlpha.directives',
    'angular-cardflow',
    'ui.router',
    'ui.bootstrap.dropdown',
    'ParseServices',
    'parse-angular',
    'ui.bootstrap',
    'ui.bootstrap.tpls',
    'googlechart',
    'HCAlpha.filters'
  ])
  .run(['ParseSDK', function(ParseService){

  }])
  .config(function($stateProvider, $urlRouterProvider, $sceDelegateProvider) {
    $sceDelegateProvider.resourceUrlWhitelist([
      'self',
      '*://www.youtube.com/**'
    ]);

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
        controller: 'patientManageCtrl',
            resolve: {
                completedExercises: function(Patient) {
                    return Patient.getCompletedExercises();
                }
            }
      })
      .state('patient', {
        url: '/patient',
        templateUrl: 'views/patient.html',
        controller: 'PatientCtrl',
        resolve: {
          exercises: function (Patient) {
            return Patient.getExercises();
          },
          completedExercises: function(Patient) {
            return Patient.getCompletedExercises();
          }
        }
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/home');

  });