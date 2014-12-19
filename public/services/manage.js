angular.module('bpApp')
  .factory('Manage', function($http, $location, $rootScope, $alert, $window) {
    return {
      delete: function(user) {
        return $http.post('/api/delete_user', user)
          .success(function(data) {
            $location.path('/manage');
            $alert({
              title: user.username.toUpperCase() + " HAS BEEN DELETED!",
              animation: 'fadeZoomFadeDown',
              type: 'material',
              duration: 3
            });
          })
          .error(function(error) {
            $alert({
              title: 'Error!',
              content: error.data,
              animation: 'fadeZoomFadeDown',
              type: 'material',
              duration: 3
            });
          });
      },
      post_edit: function(user) {
        return $http.post('/api/edit_user', user)
          .success(function(data) {
            $location.path('/manage');
            $alert({
              title: user.username.toUpperCase() + " HAS BEEN UPDATED!",
              animation: 'fadeZoomFadeDown',
              type: 'material',
              duration: 3
            });
          })
          .error(function(error) {
            $alert({
              title: 'Error!',
              content: error.data,
              animation: 'fadeZoomFadeDown',
              type: 'material',
              duration: 3
            });
          });
      },
      post_forgot: function (user) {
        return $http.post('/api/forgot', user)
            .success(function (data) {
              $location.path('/');
              $alert({
                title: "INSTRUCTIONS SENT TO " + user.email.toUpperCase(),
                animation: 'fadeZoomFadeDown',
                type: 'material',
                duration: 3
              });
            })
            .error(function (error) {
              $alert({
                title: 'Error!',
                content: error.data,
                animation: 'fadeZoomFadeDown',
                type: 'material',
                duration: 3
              });
            });
      },
      get_edit: function(user) {
        return $http.get('/api/edit_user', {
            params: {
              user_id: user.user_id
            }
          })
          .success(function(data) {
            return(data);
          })
          .error(function(error) {
            $alert({
              title: 'Error!',
              content: 'unable to fetch user data',
              animation: 'fadeZoomFadeDown',
              type: 'material',
              duration: 3
            });
          });
      },
      post_reset: function (user) {
        return $http.post('/api/reset', {
          params: {
            token: user.token,
            password: user.password
          }
        })
            .success(function (data) {
              $location.path('/login');
              $alert({
                title: "SUCCESS!",
                content: data,
                animation: 'fadeZoomFadeDown',
                type: 'material',
                duration: 3
              });
            })
            .error(function (error) {
              $alert({
                title: 'Error!',
                content: error,
                animation: 'fadeZoomFadeDown',
                type: 'material',
                duration: 3
              });
            });
      }
    };
  });
