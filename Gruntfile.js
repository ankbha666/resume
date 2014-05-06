'use strict';

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    bowerInstall: {
      target: {
        src: [
          'webapp/index.html'
        ]
      }
    }
  });
  grunt.registerTask('default', ['bowerInstall']);
};