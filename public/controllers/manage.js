angular.module('bpApp')
  .controller('ManageCtrl', function($scope, $http) {
    $http.get('/api/manage').success(function(data) {
      $scope.userData = data;
    });
  });
