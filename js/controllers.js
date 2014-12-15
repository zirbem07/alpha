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
    .controller('PatientCtrl', function($scope,$state,$modal, Patient, exercises,completedExercises){
      $scope.handle = {};

      $scope.patient = Patient;
      $scope.cards = exercises;
      $scope.completedExercises = completedExercises;
      $scope.cardflowSnapPage = {};

      $scope.coverClick = function(cover, index){
        console.log(cover);
        cover.index = index;
        $scope.open(cover);
      };

      $scope.$on('complete', function(event, data){
        $scope.cards.splice(data.index, 1);
      });

      $scope.open = function (cover) {

        var modalInstance = $modal.open({
          templateUrl: 'views/doExerciseModal.html',
          controller: 'doExerciseModalCtrl',
          size: 'lg',
          resolve: {
            exercise: function () {
              return cover;
            }
          }
        });

        modalInstance.result.then(function () {
          console.log('Modal dismissed at: ' + new Date());
        });
      };

      $scope.chartObject = {
        type: "LineChart",
        options : {
          'title': 'Your Recovery Progress'
        }
      };

      $scope.createGraphData = function(){
        var sum = 0;
        var date = $scope.completedExercises[0].attributes.date;
        $scope.rows = [];
        angular.forEach($scope.completedExercises, function(e){
          if(e.attributes.date != date) {
            //do not create object
            $scope.rows.push({c: [{v: date},{v: sum}]});
          }
          date = e.attributes.date;
          sum += e.attributes.progress;
          console.log($scope.rows);
        });
        $scope.rows.push({c: [{v: date},{v: sum}]});
        $scope.chartObject.data = {
          "cols": [
            {id: "t", label: "Date", type: "string"},
            {id: "s", label: "Progress", type: "number"}
          ], "rows": $scope.rows
        };
        console.log($scope.chartObject);
      }();
//        $scope.status = {
//            isopen: false
//        };
//
//        $scope.toggled = function(open) {
//            $log.log('Dropdown is now: ', open);
//        };
//
//        $scope.toggleDropdown = function($event) {
//            $event.preventDefault();
//            $event.stopPropagation();
//            $scope.status.isopen = !$scope.status.isopen;
//        };


    })
  .controller('doExerciseModalCtrl',
  function($scope, $state, $modalInstance, $rootScope, exercise, Patient){

    $scope.exercise = exercise;

    $scope.happy = "plain";
    $scope.mid = "plain";
    $scope.sad = "plain";


    $scope.selectPain = function(type){

     if(type == 'happy') {
       $scope.happy = "selected";
       $scope.mid = "plain";
       $scope.sad = "plain";
       $scope.selected = 1;
     } else if(type == 'mid') {
       $scope.happy = "plain";
       $scope.mid = "selected";
       $scope.sad = "plain";
       $scope.selected = .5;
     } else if(type == 'sad') {
       $scope.happy = "plain";
       $scope.mid = "plain";
       $scope.sad = "selected";
       $scope.selected = 0.1;
     }
    };

    $scope.ok = function(){

      if($scope.selected){

        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!

        var yyyy = today.getFullYear();
        if(dd<10){
          dd='0'+dd
        }
        if(mm<10){
          mm='0'+mm
        }
        today = dd+'/'+mm+'/'+yyyy;


        var params = {
          _userID: $scope.exercise.attributes.userID,
          _comments: $scope.comments || "",
          _pain: $scope.selected,
          _difficulty: $scope.exercise.attributes.level,
          _progress: $scope.exercise.attributes.level * $scope.selected,
          _date: today,
          _name: $scope.exercise.attributes.name,
          _url: $scope.exercise.attributes.url,
          _img: $scope.exercise.attributes.img,
          _id: $scope.exercise.attributes.id
        };

        Patient.completeExercise(params);
        //TODO: remove from exercises array and delete from assigned exercises.

        $rootScope.$broadcast('complete',{index: $scope.exercise.index});
        $modalInstance.dismiss('cancel');
      } else {
        alert("You must select a pain level");
      }
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

  })
  .controller('therapistCtrl', function($scope, $state, user) {
    $scope.patients = [];
    //pass the selected patients object to a factory
    //pass that object to the patientManage controller
    $scope.go = function(){
      $state.go("therapist.viewPatients");
    };
    $scope.go();

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
      $scope.user = user;
      $scope.user.patient = patient
      $state.go("therapist.managePatient");
    };

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
  .controller('patientManageCtrl', function($scope, $state, $modal, $log, user) {
    $scope.user = user;
    $scope.patient = $scope.user.patient;
    $scope.excercises = [];
    $scope.addedExcercise = [];

    $scope.getExcercises = function() {
      var query = new Parse.Query("Exercise");
      query.find({
        success: function (results) {
          for (var i = 0; i < results.length; i++) {
            $scope.excercises.push(results[i].toJSON());
          }
        },
        error: function (error) {
          // error is an instance of Parse.Error.
        }
      });
    };

    $scope.getExcercises();

    $scope.open = function (exercise) {
      var imgArr = exercise.url.split("=");
      var imgID = imgArr[1];
      var modalInstance = $modal.open({
        templateUrl: 'views/excerciseModal.html',
        controller: 'modalCtrl',
        resolve: {
          excercise: function () {
            return exercise;
          },
          urlID: function () {
            return imgID;
          }
        }
      });

      modalInstance.result.then(function () {
        console.log('Modal dismissed at: ' + new Date());
      });
    };

    //$scope.open("1");

  })
  .controller('modalCtrl', function($scope, $state, $modalInstance, excercise, urlID, user) {
    $scope.user = user;
    $scope.patient = $scope.user.patient;

    $scope.excercise = excercise;

    $scope.imgID = urlID;

    $scope.ok = function () {

      var AssignedExercise = Parse.Object.extend("AssignedExercise");
      var assignedExercise = new AssignedExercise();

      assignedExercise.set("lbsColor", $scope.excercise.lbsColor);
      assignedExercise.set("reps", parseInt($scope.excercise.reps));
      assignedExercise.set("sets", parseInt($scope.excercise.sets));
      assignedExercise.set("name", $scope.excercise.name);
      assignedExercise.set("level", $scope.excercise.level);
      assignedExercise.set("userID", $scope.patient.objectId);
      assignedExercise.set("img", $scope.excercise.img);
      assignedExercise.set("type", $scope.excercise.type);
      assignedExercise.set("url", $scope.excercise.url);
      assignedExercise.set("weightBand", $scope.excercise.weightBand);

      assignedExercise.save();

      $scope.createExcercise();

      $scope.dismiss();
    };

    $scope.dismiss = function () {
      $modalInstance.dismiss('cancel');
    }
  });