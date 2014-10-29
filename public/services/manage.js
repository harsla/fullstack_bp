angular.module('bpApp')
  .factory('Manage', function($http, $location, $rootScope, $alert, $window) {
    return {
      delete: function(user) {
        return $http.post('/api/delete_user', user)
          .success(function(data) {
            $location.path('/manage');
            $alert({
              title: user.name.toUpperCase() + " HAS BEEN DELETED!",
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
      edit: function(user) {
        return $http.post('/api/edit_user', user)
          .success(function(data) {
            $location.path('/manage');
            $alert({
              title: user.name.toUpperCase() + " HAS BEEN UPDATED!",
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
      }
    };
  });
