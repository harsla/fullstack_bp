angular.module('bpApp')
  .controller('ManageCtrl', function($scope, $http) {
    $http.get('/manage').success(function(data) {
      $scope.userData = data;
    });
  });
