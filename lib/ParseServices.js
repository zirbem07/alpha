angular.module('ParseServices', [])
.factory('ParseSDK', function() {

  // pro-tip: swap these keys out for PROD keys automatically on deploy using grunt-replace
  return Parse.initialize("0V8HfDpYK97d0gT635KcCFz0zpCapbk630JtaHDv", "j2uTVnHVHhdsMbpCmv0omNpRwbnY34kH0bq29Skt");

});