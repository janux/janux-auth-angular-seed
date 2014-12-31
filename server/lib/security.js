// var express = require('express');
// var app = express();
var passport = require('../app-context').passport;
// var MongoStrategy = require('./mongo-strategy');
var log = require('log4js').getLogger('security');

var filterUser = function(user) {
	log.debug('user in filterUser:', user);
  if ( user ) {
    return {
      user : {
        id: user._id.$oid,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        admin: user.admin
      }
    };
  } else {
		log.debug('returning null user');
    return { user: null };
  }
};

var security = {
	/*
  initialize: function(url, apiKey, dbName, authCollection) {
    passport.use(new MongoStrategy(url, apiKey, dbName, authCollection));
  },
	*/
  authenticationRequired: function(req, res, next) {
    console.log('authRequired');
    if (req.isAuthenticated()) {
      next();
    } else {
      res.json(401, filterUser(req.user));
    }
  },
  adminRequired: function(req, res, next) {
    console.log('adminRequired');
    if (req.user && req.user.admin ) {
      next();
    } else {
      res.json(401, filterUser(req.user));
    }
  },
  sendCurrentUser: function(req, res, next) {
		log.debug('calling sendCurrentUser');
    res.json(200, filterUser(req.user));
    res.end();
  },
  login: function(req, res, next) {
		log.debug('calling login');

    function authenticationFailed(err, user, info){
			log.debug('err:', err);
			log.debug('user:', user);
			log.debug('info:', info);
      if (err) { return next(err); }
      if (!user) { return res.json( {user: null} ); }
      req.logIn(user, function(err) {
        if ( err ) { return next(err); }
        return res.json(filterUser(user));
      });
    }
    return passport.authenticate('local', authenticationFailed)(req, res, next);
    // return passport.authenticate(MongoStrategy.name, authenticationFailed)(req, res, next);
  },
  logout: function(req, res, next) {
    req.logout();
    res.send(204);
  }
};

module.exports = security;
