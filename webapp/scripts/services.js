angular.module('services')
  .service('EngineerInfoService', ['$q', '$http', function ($q, $http) {

    function load(path, callback) {
      $http({method: 'GET', url: path})
        .success(callback);
    }

    this.info = function () {
      var defer = $q.defer();
      load('data/resume.xml', function (xml) {
        function processArrays(item) {
          for (var name in item) {
            var val = item[name];
            if (_.isObject(val)) {
              if (val._array) {
                item[name] = _.isArray(val.item) ? val.item : [val.item];
              }
              processArrays(val);
            }
          }
          return item;
        }
        var info = processArrays(new X2JS().xml_str2json(xml).data);
        defer.resolve(info);
      });
      return defer.promise;
    }
  }]);