angular.module('bpApp', ['ngResource', 'ngMessages', 'ngRoute', 'ngAnimate', 'mgcrea.ngStrap'])
    .config(function ($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);

        $routeProvider
            .when('/', {
                templateUrl: 'views/home.html',
                controller: 'MainCtrl'
            })
            .when('/login', {
                templateUrl: 'views/login.html',
                controller: 'LoginCtrl'
            })
            .when('/signup', {
                templateUrl: 'views/signup.html',
                controller: 'SignupCtrl'
            })
            .when('/forgot', {
                templateUrl: 'views/forgot.html',
                controller: 'ForgotCtrl'
            })
            .when('/resend/:email', {
                templateUrl: 'views/Login.html',
                controller: 'ResendCtrl'
            })
            .when('/reset/:token', {
                templateUrl: 'views/reset.html',
                controller: 'ResetCtrl'
            })
            .when('/confirm/:token', {
                templateUrl: 'views/home.html',
                controller: 'ConfirmCtrl'
            })
            .when('/secure', {
                templateUrl: 'views/secure.html',
                controller: 'SecureCtrl'
            })
            .when('/manage', {
                templateUrl: 'views/manage.html',
                controller: 'ManageCtrl'
            })
            .when('/add_user', {
                templateUrl: 'views/add_user.html',
                controller: 'AddUserCtrl'
            })
            .when('/edit_user/:user_id', {
                templateUrl: 'views/edit_user.html',
                controller: 'EditCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });
    })
    .config(function ($httpProvider) {
        $httpProvider.interceptors.push(function ($rootScope, $q, $window, $location) {
            return {
                request: function (config) {
                    if ($window.localStorage.token) {
                        // x-access-token
                        config.headers['x-access-token'] = $window.localStorage.token;
                    }
                    return config;
                },
                responseError: function (response) {
                    if (response.status === 401 || response.status === 403) {
                        $location.path('/login');
                    }
                    return $q.reject(response);
                }
            };
        });
    });
