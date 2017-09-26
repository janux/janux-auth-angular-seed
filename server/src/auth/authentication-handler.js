var passport = require('../../app-context').passport;
// var MongoStrategy = require('./mongo-strategy');
var log = require('log4js').getLogger('authentication');
var tokenHandler = require("./token-handler");
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
      res.json(401, req.user);
    }
  },

	/*
  adminRequired: function(req, res, next) {
    console.log('adminRequired');
    if (req.user && req.user.admin ) {
      next();
    } else {
      res.json(401, req.user);
    }
  },
	*/

  sendCurrentUser: function(req, res, next) {
		log.debug('sendCurrentUser: %j', req.user);

		// put the user in a 'user' field to keep it symmetric with the passport login
    res.status(200).json({user: req.user});
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
        var token = tokenHandler.generateToken(user);
        return res.json({user: user,token:token});
      });
    }
    return passport.authenticate('local', authenticationFailed)(req, res, next);
    // return passport.authenticate(MongoStrategy.name, authenticationFailed)(req, res, next);
  },

  logout: function(req, res, next) {
    req.logout();
    res.sendStatus(204);
  }
};

module.exports = security;
