angular.module('services')
  .service('EngineerInfoService', ['$q', '$http', function($q, $http) {

    function getLinkedInInfo(callback) {
      $http({method: 'GET', url: '  scripts/linkedin.json'})
        .success(callback);
    }

    this.info = function() {
      var defer = $q.defer();
      getLinkedInInfo(function(data) {
        defer.resolve(data);
      });
      return defer.promise;
    }
  }]);