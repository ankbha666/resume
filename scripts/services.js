angular.module('services')
  .service('EngineerInfoService', ['$q', '$http', function($q, $http) {

    function load(path, callback) {
      $http({method: 'GET', url: path})
        .success(callback);
    }

    this.info = function() {
      var defer = $q.defer();
      load('scripts/linkedin.json', function(info) {
        load('scripts/extra_info.json', function(extraInfo) {
          var nameToProject = _.object(_.map(info.projects, function(item) {
            return [item.name, item];
          }));
          var companyToProjects = _.object(_.map(extraInfo.projectMappings, function(mapping) {
            return [mapping.company, _.map(mapping.projects, function(name) {
              return nameToProject[name];
            })];
          }));
          _.each(info.careerHistory, function(item) {
            item.projects = companyToProjects[item.company.name];
          });
          info.photoImageUrl = extraInfo.photoImageUrl;

          defer.resolve(info);
        })
      });
      return defer.promise;
    }
  }]);