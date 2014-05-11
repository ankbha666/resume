var express = require('express');
var app = express();
var linkedIn = require('./linkedin');
var _ = require('underscore');

var session = {};

var servicesDefinitions = [{
  name : 'linkedin',
  service: linkedIn.service,
  defaultActionName: 'exportResume',
  initialized: false
}];

function getServiceActionUrl(definition, action) {
  return '/' + definition.name + '/' + action;
}

function getServiceSession(definition) {
  var result = session[definition.name];
  if (!result) {
    result = {};
    session[definition.name] = result;
  }
  return result;
}

_.each(servicesDefinitions, function(definition) {
  var service = definition.service;
  app.get('/' + definition.name + '/verify', function(req, res) {
    var serviceSession = getServiceSession(definition);
    if (_.has(serviceSession, 'requestToken')) {
      service.verifyOAuthToken(serviceSession.requestToken, req.query.oauth_verifier, function(token) {
        serviceSession.token = token;
        res.redirect(getServiceActionUrl(
          definition, serviceSession.requestedActionName || definition.defaultActionName));
      });
    } else {
      res.send('Request token not found!');
    }
  });

  _.each(definition.service.actions, function(action) {
    app.get(getServiceActionUrl(definition, action.name), function(req, res) {
      var serviceSession = getServiceSession(definition);
      if (!_.has(serviceSession, 'token')) {
        serviceSession.requestedActionName = action.name;
        if (!definition.initialized) {
          service.init({
            verifyUrl: 'http://' + req.get('host') + '/' + definition.name + '/verify'
          });
          definition.initialized = true;
        }
        service.requestOAuthToken(function(redirectUrl, requestToken) {
          serviceSession.requestToken = requestToken;
          res.redirect(redirectUrl);
        });
      } else {
        action.execute(serviceSession.token, function(result) {
          res.send(result);
        });
      }
    });
  })
});

app.listen(8080);
