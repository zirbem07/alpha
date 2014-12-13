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
      query.equalTo("userID", o.id);
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