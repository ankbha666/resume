'use strict';

angular.module('controllers')
  .controller('ResumeCtrl', ['$scope', 'EngineerInfoService',
    function ($scope, EngineerInfoService) {
      EngineerInfoService.info().then(function (info) {
        $scope.info = info;
      });
    }]);
