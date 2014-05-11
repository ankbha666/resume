var express = require('express');
var app = express();
var linkedIn = require('./linkedin');
var builder = require('xmlbuilder');
var _ = require('underscore');

var session = {};

var servicesDefinitions = [{
  name : 'linkedin',
  service: linkedIn.service,
  defaultActionName: 'exportResume',
  initialized: false
}];

function toXml(data, xml) {
  var xml = xml || builder.create('data');
  var isArray = _.isArray(data);
  for (var name in data) {
    var val = data[name];
    var elemName = isArray ? 'item' : name;
    if (_.isArray(val)){
      toXml(val, xml.ele(elemName, { array: 'true' }));
    } else if (_.isObject(val)) {
      toXml(val, xml.ele(elemName));
    } else {
      xml.ele(elemName,{}, val)
    }
  }
  return xml;
}

function getServiceActionUrl(definition, action, params) {
  params = params || {};
  var url = '/' + definition.name + '/' + action;
  var query = [];
  for (var name in params) {
    query.push(name + '=' + params[name]);
  }
  if (query.length > 0) {
    url += '?' + query.join("&");
  }
  return url;
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
        res.redirect(getServiceActionUrl(definition,
            serviceSession.requestedActionName || definition.defaultActionName, serviceSession.requestedActionQuery));
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
        serviceSession.requestedActionQuery = req.query;
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
        serviceSession.requestedActionName = null;
        serviceSession.requestedActionQuery = null;
        action.execute(serviceSession.token, function(result) {
          var format = req.query.format || 'xml';
          if (format == 'xml') {
            res.set('Content-Type', 'application/xml');
            res.send(toXml(result).end({pretty: true}));
          } else {
            res.set('Content-Type', 'application/json');
            res.send(JSON.stringify(result, undefined, 2));
          }
        });
      }
    });
  })
});

app.listen(8080);
