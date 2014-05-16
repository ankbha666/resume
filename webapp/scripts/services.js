angular.module('services')
  .service('EngineerInfoService', ['$q', '$http', function ($q, $http) {

    function load(path, callback) {
      $http({method: 'GET', url: path})
        .success(callback);
    }

    this.info = function () {
      var defer = $q.defer();
      load('data/resume.xml', function (xml) {
        function process(item) {
          for (var name in item) {
            var val = item[name];
            // Get rid of attribute prefixed. Implemented here due to X2JS requires some prefix.
            if (name.indexOf('_') == 0) {
              item[name.slice(1)] = val;
              delete item[name];
            }
            if (_.isObject(val)) {
              // Transform xml array into real json arrays.
              if (val._array) {
                item[name] = _.isArray(val.item) ? val.item : [val.item];
              }
              process(val);
            }
          }
          return item;
        }
        var info = process(new X2JS().xml_str2json(xml).data);
        defer.resolve(info);
      });
      return defer.promise;
    }
  }]);