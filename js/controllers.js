angular.module('HCAlpha.controllers', [])

    .controller('HomeCtrl', function($scope, $state, Patient){

        $scope.loginClick = function() {

          $scope.email = "nicole@test.com";
          $scope.password = "test";
          Parse.User.logIn($scope.email, $scope.password, {
            success: function(user) {
              if(user.attributes.type == 'patient') {

                var query = new Parse.Query("Patient");
                query.equalTo("parent", user.id);
                query.first()
                  .then(function(result){

                    Patient.id = result.id;
                    Patient.userID = result.attributes.parent;
                    Patient.clinicID = result.attributes.clinicID;
                    Patient.injuryLevel = result.attributes.injuryLevel;
                    Patient.injuryType = result.attributes.injuryType;
                    $state.go('patient');
                  });

              }
              else if(user.attributes.type == 'therapist') {
                //TODO: Get Thearpists info
                $state.go('managePatient')
              }
              else {
                //TODO: Force Logout
                alert("invalid user type: "+ user.attributes.type)
              }
            },
            error: function(user, error) {
              // The login failed. Check error to see why.
            }
          });

        }
    })
    .controller('PatientCtrl', function($scope,$state, Patient, exercises, $log){
        $scope.handle = {};

        $scope.patient = Patient;
        $scope.exercises = exercises;
        console.log(exercises);

        $scope.cards = [
          {image:'http://placekitten.com/g/400/400', title: 't'},
          {image:'http://placekitten.com/g/400/400', title: 't'},
          {image:'http://placekitten.com/g/400/400', title: 't'},
          {image:'http://placekitten.com/g/400/400', title: 't'},
          {image:'http://placekitten.com/g/400/400', title: 't'},
          {image:'http://placekitten.com/g/400/400', title: 't'},
          {image:'http://placekitten.com/g/400/400', title: 't'},
          {image:'http://placekitten.com/g/400/400', title: 't'},
          {image:'http://placekitten.com/g/400/400', title: 't'},
          {image:'http://placekitten.com/g/400/400', title: 't'},
          {image:'http://placekitten.com/g/400/400', title: 't'},
          {image:'http://placekitten.com/g/400/400', title: 't'},
          {image:'http://placekitten.com/g/400/400', title: 't'},
          {image:'http://placekitten.com/g/400/400', title: 't'},
          {image:'http://placekitten.com/g/400/400', title: 't'},
          {image:'http://placekitten.com/g/400/400', title: 't'},
          {image:'http://placekitten.com/g/400/400', title: 't'}
        ];

        $scope.cardflowNone = {};
        $scope.cardflowSnapOne = {};
        $scope.cardflowSnap = {};
        $scope.cardflowSnapPage = {};
        $scope.cardflowSnapKinetic = {};
        $scope.cardflowNonePage = {};
        $scope.cardflowSwipe = {};

        $scope.coverClick = function(cover){
          alert("called");
            console.log(cover);
        };

        $scope.status = {
            isopen: false
        };

        $scope.toggled = function(open) {
            $log.log('Dropdown is now: ', open);
        };

        $scope.toggleDropdown = function($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.status.isopen = !$scope.status.isopen;
        };
    })
  .controller('therapistCtrl', function($scope, $state, user) {
    $scope.patients = [];
    $scope.go = function(){
      $state.go("therapist.viewPatients");
    };

    $scope.getPatients = function(id){
      var clinicID = 1;
      var query = new Parse.Query("Patient");
      query.equalTo("clinicID", clinicID);
      query.find({
        success: function(results) {
          for(var i = 0; i < results.length; i++) {
            $scope.patients.push(results[i].toJSON());
          }
        },
        error: function(error) {
        }
      });
    };

    $scope.manageThisPatient = function(patient){
      user.patient = patient;
      $state.go("therapist.managePatient");
    }

    $scope.status = {
      isopen: false
    };

    $scope.toggled = function(open) {
      $log.log('Dropdown is now: ', open);
    };
    //this
    $scope.toggleDropdown = function($event) {
      $event.preventDefault();
      $event.stopPropagation();
      $scope.status.isopen = !$scope.status.isopen;
    };

  })
  .controller('SignUpCtrl', function($scope, $state){

    $scope.email="n@test.com";
    $scope.type="patient";

      $scope.signUpClick = function() {
        //TODO: Parse Query to validate user in factory
        if ($scope.email && $scope.password) {
          var user = new Parse.User();
          user.set("username", $scope.email);
          user.set("password", $scope.password);
          user.set("email", $scope.email);
          user.set("type", $scope.type);
          if($scope.type == 'patient'){
            var Patient = Parse.Object.extend("Patient");
            var newPatient = new Patient();
            newPatient.set("injuryLevel", 1);

          }
          else if($scope.type == 'therapist'){

          }

          user.signUp(null, {
            success: function(user) {
              newPatient.set("parent", user.id);
              newPatient.save();

            },
            error: function(user, error) {
              // Show the error message somewhere and let the user try again.
              alert("Error: " + error.code + " " + error.message);
            }
          });
        }
      }
  })
  .controller('patientManageCtrl', function($scope, $state, $modal, $log, $interval, user, addedExercise) {
    $scope.patient = user.patient;
    console.log($scope.patient);
    $scope.weeklyExercise = [];

    $scope.exercises = [];
    $scope.addedExercise = addedExercise.theExercises();

    $scope.getExercise = function() {
      var query = new Parse.Query("Exercise");
      query.find({
        success: function (results) {
          for (var i = 0; i < results.length; i++) {
            $scope.exercises.push(results[i].toJSON());
          }
        },
        error: function (error) {
          // error is an instance of Parse.Error.
        }
      });
    };

    $scope.getWeeklyExercise = function(){
        var date = $scope.patient.createdAt.substr(0,10);

    }

    $scope.getWeeklyExercise();
    $scope.getExercise();

    $scope.addExercise = function(x){
        addedExercise.push(x);
    }

    $scope.open = function (exercise) {
      $interval.cancel($scope.promise);
      var imgArr = exercise.url.split("=");
      var imgID = imgArr[1];
      var modalInstance = $modal.open({
        templateUrl: 'views/excerciseModal.html',
        controller: 'modalCtrl',
        resolve: {
          exercise: function () {
            return exercise;
          },
          urlID: function () {
            return imgID;
          },
          patientObj: function () {
            return $scope.patient;
          }
        }
      });

      modalInstance.result.then(function () {
        $log.info('Modal dismissed at: ' + new Date());
      });
    };

        var promise;
        var i = 0;

        $scope.mouseDown = function (x) {
            if(i == 0) {
                i++;
                promise = $interval(function () {
                    $scope.openIt(x);
                    $interval.cancel(promise);
                }, 1500);
            }

        };

        $scope.mouseUp = function () {
            i = 0;
            $interval.cancel(promise);

        };

        $scope.openIt = function (x) {
            if(i == 1){
                i = 0;
                $scope.open(x);
            }
        };

  })
  .controller('modalCtrl', function($scope, $state, $modalInstance, exercise, urlID, patientObj, addedExercise) {
    $scope.patient = patientObj;

    $scope.exercise = exercise;
    
    $scope.imgID = urlID;

    $scope.ok = function () {

      var AssignedExercise = Parse.Object.extend("AssignedExercise");
      var assignedExercise = new AssignedExercise();

      assignedExercise.set("lbsColor", $scope.exercise.lbsColor);
      assignedExercise.set("reps", parseInt($scope.exercise.reps));
      assignedExercise.set("sets", parseInt($scope.exercise.sets));
      assignedExercise.set("name", $scope.exercise.name);
      assignedExercise.set("level", $scope.exercise.level);
      assignedExercise.set("userID", $scope.patient.objectId);
      assignedExercise.set("img", $scope.exercise.img);
      assignedExercise.set("type", $scope.exercise.type);
      assignedExercise.set("url", $scope.exercise.url);
      assignedExercise.set("weightBand", $scope.exercise.weightBand);

      assignedExercise.save();

      $scope.assignExercise();
    };

    $scope.assignExercise = function () {
      var exerciseToAssign = {};
        exerciseToAssign.lbsColor = $scope.exercise.lbsColor;
        exerciseToAssign.reps = parseInt($scope.exercise.reps);
        exerciseToAssign.sets = parseInt($scope.exercise.sets);
        exerciseToAssign.name = $scope.exercise.name;
        exerciseToAssign.level = $scope.exercise.level;
        exerciseToAssign.img = $scope.exercise.img;
        exerciseToAssign.type = $scope.exercise.type;
        exerciseToAssign.url = $scope.exercise.url;
        exerciseToAssign.weightBand = $scope.exercise.weightBand;

        addedExercise.push(exerciseToAssign);

        $scope.dismiss();
    }

    $scope.dismiss = function () {
      $modalInstance.dismiss('cancel');
    }
  });