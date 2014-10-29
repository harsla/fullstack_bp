angular.module('bpApp')
  .directive('userPanel', function() {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function(scope, element, attrs, ngModel) {
      }
    };
  });
