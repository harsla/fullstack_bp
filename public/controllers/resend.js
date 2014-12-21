angular.module('bpApp')
    .controller('ResendCtrl', function ($scope, $http, $routeParams, Auth) {
        Auth.resend({email: $routeParams.email});
    });