"use strict";angular.module("controllers",[]),angular.module("services",[]),angular.module("webApp",["services","controllers"]),angular.module("controllers").controller("MainCtrl",["$scope","EngineerInfoService",function(a,b){b.info().then(function(b){a.info=b})}]),angular.module("services").service("EngineerInfoService",["$q","$http",function(a,b){function c(a,c){b({method:"GET",url:a}).success(c)}this.info=function(){var b=a.defer();return c("data/linkedin.json",function(a){c("data/extra_info.json",function(c){var d=_.object(_.map(a.projects,function(a){return[a.name,a]})),e=_.object(_.map(c.projectMappings,function(a){return[a.company,_.map(a.projects,function(a){return d[a]})]}));_.each(a.careerHistory,function(a){a.projects=e[a.company.name]}),a.photoImageUrl=c.photoImageUrl,b.resolve(a)})}),b.promise}}]);