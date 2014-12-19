angular.module('bpApp')
  .controller('EditCtrl', function($scope, $http, $routeParams, Manage) {

    // Populate the user data
      Manage.get_edit($routeParams).success(function(user){
        $scope.displayName = user.name;
        $scope.email = user.email;
      });

      //send the edits
      $scope.edit = function () {
        user = {
          _id: $routeParams.user_id,
          name: $scope.displayName,
            email: $scope.email
        };
        if ($scope.password) {
          user.password = $scope.password;
        }
        Manage.post_edit(user);
      };

  });
