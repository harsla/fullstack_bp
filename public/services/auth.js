angular.module('bpApp')
  .factory('Auth', function($http, $location, $rootScope, $alert, $window) {
    var token = $window.localStorage.token;
    if (token) {
      var payload = JSON.parse($window.atob(token.split('.')[1]));
      $rootScope.currentUser = payload.user;
    }

    return {
      login: function(user) {
        return $http.post('/api/login', user)
          .success(function(data) {
            $window.localStorage.token = data.token;
            var payload = JSON.parse($window.atob(data.token.split('.')[1]));
            $rootScope.currentUser = payload.user;
            $location.path('/');
            $alert({
              title: 'HELLO, ',
              content: payload.user.name.toUpperCase() + "!  ",
              animation: 'fadeZoomFadeDown',
              type: 'material',
              duration: 5
            });
          })
          .error(function(data) {
            delete $window.localStorage.token;
            $alert({
              title: 'Error!',
              content: data,
              animation: 'fadeZoomFadeDown',
              type: 'material',
              duration: 5
            });
          });
      },
      signup: function(user) {
        return $http.post('/api/signup', user)
            .success(function (data) {
            $location.path('/login');
            $alert({
              title: 'Congratulations!',
              content: data,
              animation: 'fadeZoomFadeDown',
              type: 'material',
              duration: 5
            });
          })
          .error(function(response) {
            $alert({
              title: 'Error!',
              content: response.data,
              animation: 'fadeZoomFadeDown',
              type: 'material',
              duration: 5
            });
          });
      },
      confirm: function (token) {
        return $http.post('/api/confirm', token)
            .success(function (data) {
              $location.path('/home');
              $alert({
                title: 'Account Activated!',
                content: data,
                animation: 'fadeZoomFadeDown',
                type: 'material',
                duration: 5
              });
            })
            .error(function (response) {
              $alert({
                title: 'Error!',
                content: response,
                animation: 'fadeZoomFadeDown',
                type: 'material',
                duration: 3
              });
            });
      },
      resend: function (email) {
        return $http.post('/api/resend', email)
            .success(function (data) {
              $location.path('/login');
              $alert({
                title: 'Email Sent',
                content: 'Please check your email for instructions',
                animation: 'fadeZoomFadeDown',
                type: 'material',
                duration: 5
              });
            })
            .error(function (response) {
              $alert({
                title: 'Error!',
                content: response,
                animation: 'fadeZoomFadeDown',
                type: 'material',
                duration: 3
              });
            });
      },
      addUser: function(user) {
        return $http.post('/api/add_user', user)
          .success(function() {
            $location.path('/manage');
            $alert({
              title: 'Success!',
              content: 'user account has been created.',
              animation: 'fadeZoomFadeDown',
              type: 'material',
              duration: 5
            });
          })
          .error(function(response) {
            $alert({
              title: 'Error!',
              content: response.data,
              animation: 'fadeZoomFadeDown',
              type: 'material',
              duration: 5
            });
          });
      },
      logout: function() {
        delete $window.localStorage.token;
        $rootScope.currentUser = null;
        $alert({
          content: 'You have been logged out.',
          animation: 'fadeZoomFadeDown',
          type: 'material',
          duration: 5
        });
      }
    };
  });
