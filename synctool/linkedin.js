var config = require('./config');
var lin = require('linkedin-node');
var _ = require('underscore');
var moment = require('moment');


function formatPeriod(startDate, endDate) {
  var start = null;
  if (startDate) {
    start = moment.utc([startDate.year, startDate.month, startDate.day])
  }
  var end = null;
  if (endDate) {
    end = moment.utc([endDate.year, endDate.month, endDate.day])
  }
  var pattern = "MMMM, YYYY";
  if (start != null && end != null) {
    return start.format(pattern) + " - " + end.format(pattern)
  } else if (start != null) {
    return start.format(pattern)
  } else if (end != null ){
    return end.format(pattern)
  } else {
    return ""
  }
}

module.exports = {
  service: {
    init: function (options) {
      lin.init({
        'env': 'production',
        'oauth': {
          'apiKey': config.linkedin.apiKey,
          'apiSecret': config.linkedin.apiSecret,
          'requestTokenCallback': options.verifyUrl
        }
      });
    },
    requestOAuthToken: function (callback) {
      lin.requestToken(function (err, response) {
        callback(response.redirectUrl, {
          requestToken: response.requestToken,
          requestTokenSecret: response.requestTokenSecret
        });
      });
    },
    verifyOAuthToken: function (requestToken, oauthVerifier, callback) {
      lin.accessToken(requestToken.requestToken, requestToken.requestTokenSecret, oauthVerifier,
        function (err, response) {
          callback({
            token: response.accessToken,
            secret: response.accessTokenSecret
          });
        });
    },
    actions: [{
      name: 'export',
      execute: function(token, callback) {
        var req = lin.api('v1', 'peopleAPI', 'profile', {
          fields: ":(formatted-name,headline,picture-url,positions,skills,summary,projects)"
        });
        lin.makeRequest({ token: token }, { api: req }, function(err, res) {
          var data = JSON.parse(res.response.body);
          var projects = _.map(data.projects.values, function(project) {
            return {
              name: project.name,
              description: project.description
            }
          });
          callback({
            photoImageUrl: data.pictureUrl,
            fullName: data.formattedName,
            position: data.headline,
            summary: data.summary,
            careerHistory: _.map(data.positions.values, function(position){
              var item = {
                position: position.title,
                company: { name: position.company.name },
                period: formatPeriod(position['startDate'], position['endDate'])
              };
              // Assign all projects to first position because linked in API does not provide real mapping
              if (projects.length > 0) {
                item.projects = projects;
                projects = [];
              }
              return item;
            }),
            skills: _.map(data.skills.values, function(item) {
              return item.skill.name
            })
          });
        });
      }
    }]
  }
};
