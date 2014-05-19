angular.module('controllers', []);
angular.module('services', []);

var webApp = angular.module('webApp', [
  'services',
  'controllers',
  'ngRoute']);

webApp.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: 'views/resume.html',
    controller: 'ResumeCtrl'
  })
}]);