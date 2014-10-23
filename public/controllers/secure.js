angular.module('bpApp')
  .controller('SecureCtrl', function($scope, $http) {
    $http.get('/account').success(function(data) {
    });
  });
