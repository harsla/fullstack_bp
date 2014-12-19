angular.module('bpApp')
    .controller('ConfirmCtrl', function ($scope, $http, $routeParams, Auth) {
        //Send the token off to the server
        Auth.confirm({token: $routeParams.token});
        // we should log the user in
    });