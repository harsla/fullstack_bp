angular.module('bpApp')
  .controller('AddUserCtrl', function($scope, Auth) {
    $scope.addUser = function() {
      Auth.addUser({
        username: $scope.displayName,
        email: $scope.email,
        password: $scope.password
      });
    };
    $scope.pageClass = 'fadeZoom';
  });
