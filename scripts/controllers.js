'use strict';

angular.module('controllers', []);
angular.module('services', []);
angular.module('webApp', ['services', 'controllers']);


angular.module('controllers')
  .controller('MainCtrl', ['$scope', 'EngineerInfoService',
    function ($scope, EngineerInfoService) {
      EngineerInfoService.info().then(function (info) {
        $scope.info = info;
      });
    }]);