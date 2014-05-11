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
            src: [
              '*.html',
              'data/**/*',
            ],
            dest: '<%= app.dist %>'
          }
        ]
      }
    },
    useminPrepare: {
      html: '<%= app.path %>/index.html',
      options: {
        dest: '<%= app.dist %>'
      }
    },
    usemin: {
      html: ['<%= app.dist %>/{,*/}*.html'],
      css: ['<%= app.dist %>/styles/{,*/}*.css'],
      options: {
        assetsDirs: ['<%= app.dist %>']
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
            src: [
              '.tmp',
              '<%= app.dist %>'
            ]
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
    },
    buildcontrol: {
      options: {
        dir: 'dist',
        commit: true,
        push: true,
        message: 'Built %sourceName% from commit %sourceCommit% on branch %sourceBranch%'
      },
      pages: {
        options: {
          remote: 'git@github.com:alexmt/resume.git',
          branch: 'gh-pages'
        }
      }
    }
  });
  grunt.registerTask('build',[
    'clean:dist',
    'bowerInstall',
    'useminPrepare',
    'concat',
    'cssmin',
    'uglify',
    'copy:dist',
    'usemin'
  ]);
  grunt.registerTask('default', ['build']);
};