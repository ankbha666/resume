'use strict';

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    app :{
      path: 'webapp',
      dist: 'dist',
      domain: 'amatyushentsev.com'
    },
    copy: {
      dist: {
        files: [
          {
            expand: true,
            cwd: '<%= app.path %>',
            src: [
              '*.html',
              'views/**/*',
              '*.ico',
              'data/**/*',
              'bower_components/github-activity/github-activity.min.css'
            ],
            dest: '<%= app.dist %>'
          }
        ]
      },
      fonts: {
        files: [
          {
            expand: true,
            flatten: true,
            cwd: '<%= app.path %>',
            src: [
              'bower_components/components-font-awesome/fonts/*'
            ],
            dest: '<%= app.dist %>/fonts'
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
            cwd: '<%= app.dist %>',
            src: ['index.html', 'views/**/*'],
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
  grunt.registerTask('cname', 'Generates CNAME files for github pages', function() {
    var app = grunt.config.get('app');
    grunt.file.write(app.dist + '/CNAME', app.domain);
  });
  grunt.registerTask('build',[
    'clean:dist',
    'bowerInstall',
    'useminPrepare',
    'concat',
    'cssmin',
    'uglify',
    'copy:dist',
    'usemin',
    'htmlmin',
    'copy:fonts',
    'cname'
  ]);
  grunt.registerTask('default', ['build']);
};