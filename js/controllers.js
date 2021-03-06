angular.module('HCAlpha.controllers', [])

    .controller('HomeCtrl', function($scope, $state, Patient){

        $scope.loginClick = function() {


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
                $state.go('therapist')
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
    .controller('PatientCtrl', function($scope,$state,$modal, Patient, exercises, completedExercises){
      $scope.handle = {};

      $scope.patient = Patient;
      $scope.cards = exercises;
      $scope.completedExercises = completedExercises;
      if(completedExercises){
        $scope.recent = completedExercises[completedExercises.length -1];
        console.log($scope.recent);

      } else {
        $scope.recent = "No recent exercises";
      }
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
        if($scope.completedExercises[0]){
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
          console.log($scope.chartObject)
        }
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
       $scope.selected = .5;
     } else if(type == 'mid') {
       $scope.happy = "plain";
       $scope.mid = "selected";
       $scope.sad = "plain";
       $scope.selected = .2;
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
        today = yyyy+'-'+mm+'-'+dd;


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
  .controller('therapistCtrl', function($scope, $state, user, $modal) {
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

    $scope.open = function () {
      var modalInstance = $modal.open({
          templateUrl: 'views/signPatientUp.html',
          controller: 'SignUpCtrl',
      });
    }

  })
  .controller('SignUpCtrl', function($scope, $state, $modalInstance){

    $scope.email="n@test.com";
    $scope.type="patient";
        $scope.dismiss = function () {
            $modalInstance.dismiss('cancel');
        }

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
              newPatient.set("clinicID", 1);
              newPatient.set("injuryType", "shoulder");
              newPatient.set("firstName", $scope.firstName);
              newPatient.set("lastName", $scope.lastName);

          }
          else if($scope.type == 'therapist'){
              var Therapist = Parse.Object.extend("Therapist");
              var newTherapist = new Therapist();
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
          $scope.dismiss();
      }
  })
  .controller('patientManageCtrl', function($scope, $state, $modal, $log, $interval, user, addedExercise, completedExercises, weekExercises) {
    $scope.patient = user.patient;
    $scope.weeklyExercise = completedExercises;
    $scope.eachWeek = [];
    $scope.exercises = [];
    $scope.addedExercise = addedExercise.theExercises();

      /*var options = {
        preventDefault: true
      };
      var exScroll = new Hammer('exercisesForPatient', options);
      exScroll.get('swipe').set({ direction: Hammer.DIRECTION_VERTICAL });
      hammertime.on("dragup dragdown swipeup swipedown", function(ev){ });*/
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
    $scope.setWeeklyExercises = function(){
      var theDate = new Date($scope.patient.createdAt.substr(0,10));
      var newDate = new Date(theDate);
      var rangeDate = new Date();
      newDate.setDate(newDate.getDate() + 7);
      var today = new Date();


      while(newDate < today){
        rangeDate.setDate(newDate.getDate() - 7);
        $scope.eachWeek.push({'range':rangeDate.toDateString() + "-" + newDate.toDateString(),'date':newDate.toDateString(),
                              'thisWeeks': [],'painScore':0});
        rangeDate.setDate(newDate.getDate());
        newDate.setDate(newDate.getDate() +  7);
      }
      $scope.eachWeek.push({'range': rangeDate.toDateString() + "-" + today.toDateString(),'date':today.toDateString(),
                            'thisWeeks': [],'painScore':0, 'points': 0});
      while($scope.weeklyExercise.length >= 1){
        var tempDate = new Date($scope.weeklyExercise[0].attributes.date.substr(0,10)).toDateString();
        for(var j=0; j < $scope.eachWeek.length; j++){
          if (Date.parse(tempDate) < Date.parse($scope.eachWeek[j].date) && $scope.weeklyExercise[0] !== undefined) {
            $scope.eachWeek[j].thisWeeks.push($scope.weeklyExercise[0]);
            $scope.eachWeek[j].painScore += $scope.weeklyExercise[0].attributes.pain;
            $scope.eachWeek[j].painScore += $scope.weeklyExercise[0].attributes.pain;
            $scope.weeklyExercise.splice(0,1);
          }
        }
      }
    };

    $scope.setWeeklyExercises();
    $scope.getExercise();

    $scope.addExercise = function(x){
        addedExercise.push(x);
    };

    $scope.removeExercise = function(ex){
        var index = $scope.addedExercise.indexOf(ex);
        $scope.addedExercise.splice(index,1);
    }

    $scope.open = function (exercise) {
      $interval.cancel(promise);
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
        console.log('Modal dismissed at: ' + new Date());
      });
    };

      var promise;
      var t = 0;

      $scope.mouseDown = function (x) {
          if(t == 0) {
              t = 1;
              promise = $interval(function () {
                  $scope.openIt(x);
                  $interval.cancel(promise);
              }, 1500);
          }

      };

      $scope.mouseUp = function () {
          t = 0;
          $interval.cancel(promise);

      };

      $scope.openIt = function (x) {
          if(t == 1){
              t = 0;
              $scope.open(x);
          }
      };

      $scope.viewWeek = function(x){
        weekExercises.week = x;
        $state.go("therapist.viewWeek");
      }

  })
  .controller('modalCtrl', function($scope, $state, $modalInstance, exercise, urlID, patientObj, addedExercise) {
    $scope.patient = patientObj;
    $scope.addedComments = "";
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
      assignedExercise.set("comments", $scope.addedComments);

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
        exerciseToAssign.comments = $scope.addedComments;
        addedExercise.push(exerciseToAssign);

        $scope.dismiss();
    }

    $scope.dismiss = function () {
      $modalInstance.dismiss('cancel');
    }
  })
    .controller('weeklyCtrl', function($scope, weekExercises){
      $scope.thisWeek = weekExercises.week;
      console.log($scope.thisWeek);
    });