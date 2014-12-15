angular.module('HCAlpha.services', [])
.factory('Patient', function($q, $rootScope){
    var o = {
      injuryLevel: 0,
      injuryType: "",
      clinicID: "",
      userID: "",
      id: ""
    };

    o.getExercises = function(){
      var deferred = $q.defer();
      var query = new Parse.Query("AssignedExercise");
      query.equalTo("userID", 'xgZoRrUL7D');
      //TODO change ^^^ to query.equalTo("userID", o.id);
      query.find()
        .then(function(data){
          $rootScope.$$phase || $rootScope.$apply();
          deferred.resolve(data);
        });

      return deferred.promise;
    };

    o.completeExercise = function(params){
      var Complete = Parse.Object.extend("CompletedExercises");
      var exercise = new Complete();

      // set object properties
      exercise.set("userID", params._userID);
      exercise.set("comments", params._comments);
      exercise.set("pain", params._pain);
      exercise.set("difficulty", params._difficulty);
      exercise.set("name", params._name);
      exercise.set("date", params._date + "");
      exercise.set("img", params._img);
      exercise.set("url", params._url);
      exercise.set("progress", params._progress);
      // save object to parse backend
      exercise.save();
    };

    o.getCompletedExercises = function() {
      var deferred = $q.defer();
      var query = new Parse.Query("CompletedExercises");
      query.equalTo("userID", 'xgZoRrUL7D');
      //TODO change ^^^ to query.equalTo("userID", o.id);
      query.find()
        .then(function(data){
          $rootScope.$$phase || $rootScope.$apply();
          deferred.resolve(data);
        });

      return deferred.promise;
    };
    return o;
})
.factory("user",function(){
  return {};
})
.factory("addedExercise",function(){
  return {};
});