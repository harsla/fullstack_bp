angular.module('bpApp')
    .directive('resendActivation', function ($http) {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
                element.bind('blur', function () {
                    if (ngModel.$modelValue) {
                        $http.get('/api/check_activated', {
                            params: {
                                email: ngModel.$modelValue
                            }
                        }).success(function (data) {
                            ngModel.$setValidity('activated', data.activated);
                        });
                    }
                });
                element.bind('keyup', function () {
                    ngModel.$setValidity('unique', true);
                });
            }
        };
    });
