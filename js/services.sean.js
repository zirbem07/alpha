angular.module('HCAlpha.services', [])
.factory('Patient', function(){
    return {
      injuryLevel: 0,
      injuryType: "",
      clinicID: "",
      userID: "",
      id: "",
      getExercises : function(id){

        var query = new Parse.Query("Exercise");
        query.equalTo("type", "shoulder");
        query.find()
          .then(function(result){
            console.log(result.attributes);
            return result;
          });
      }
    }
})
.factory("user",function(){
        return {};
})
.factory("addedExercise",function(){
        return {};
});
