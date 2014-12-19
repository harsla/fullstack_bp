angular.module('bpApp')
    .controller('ResetCtrl', function ($scope, $http, $routeParams, Manage) {

        //send the edits
        $scope.reset = function () {
            var user = {
                token: $routeParams.token,
                password: $scope.password
            };
            Manage.post_reset(user);
        }

    });
