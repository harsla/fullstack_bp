angular.module('bpApp')
  .controller('NavbarCtrl', function($scope, Auth) {
    $scope.logout = function() {
      Auth.logout();
    };
  });
