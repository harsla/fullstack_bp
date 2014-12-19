angular.module('bpApp')
    .controller('ForgotCtrl', function ($scope, Manage) {
        $scope.forgot = function () {
            Manage.post_forgot({
                email: $scope.email
            });
        };
        $scope.pageClass = 'fadeZoom';
    });