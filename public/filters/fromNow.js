angular.module('bpApp').
  filter('fromNow', function() {
    return function(date) {
      return moment(date).fromNow();
    };
  });
