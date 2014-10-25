angular.module('bpApp')
  .controller('SecureCtrl', function($scope, $http) {
    $http.get('/api/account').success(function(data) {
    });
  });
