'user strict';

var log4js = require('log4js'),
	log = log4js.getLogger('UserService - client side'),
	userDAO = require('janux-people.js').UserDAO.object('../server/janux-people.db'), // createInstance('../server/janux-people.db');
	demoUserService = require('janux-people.js').UserService.singleton(userDAO);

// var service = {
// 	findByUsername: function(username, done) {
// 		return userDAO.findByUsername(username).asCallback(done);
// 	}
// };

module.exports = demoUserService;

