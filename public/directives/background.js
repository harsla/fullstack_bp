angular.module('bpApp')
  .directive('background', function($http) {
    return function(scope, element, attrs) {
      $http.get('./lib/backgrounds.json').success(function(data) {
       var pick = Math.floor((Math.random() * 693) + 1);

       element.css({
         'background-image': 'url(' + data[pick].url + ')',
       });

       });
    };
  });
