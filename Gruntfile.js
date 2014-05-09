'use strict';

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    app :{
      path: 'webapp',
      dist: 'dist'
    },
    copy: {
      dist: {
        files: [
          {
            expand: true,
            cwd: '<%= app.path %>',
            src: './**/*',
            dest: '<%= app.dist %>'
          }
        ]
      }
    },
    htmlmin: {
      dist: {
        options: {
          collapseWhitespace: true,
          collapseBooleanAttributes: true,
          removeCommentsFromCDATA: true,
          removeOptionalTags: true
        },
        files: [
          {
            expand: true,
            cwd: '<%= app.path %>',
            src: ['index.html'],
            dest: '<%= app.dist %>'
          }
        ]
      }
    },
    clean: {
      dist: {
        files: [
          {
            src: [ '<%= app.dist %>' ]
          }
        ]
      }
    },
    bowerInstall: {
      target: {
        src: [
          '<%= app.path %>/index.html'
        ]
      }
    }
  });
  grunt.registerTask('build',[
    'clean:dist',
    'bowerInstall',
    'copy:dist',
    'htmlmin'
  ]);
  grunt.registerTask('default', ['build']);
};