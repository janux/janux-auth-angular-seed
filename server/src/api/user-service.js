'user strict';

var log4js = require('log4js'),
	userDAO = require('janux-people.js').UserDAO.createInstance('../server/janux-people.db');
	// userService = require('janux-people.js').UserService.singleton(userDAO);

// var service = {
// 	findByUsername: function(username, done) {
// 		return userDAO.findByUsername(username).asCallback(done);
// 	}
// };

module.exports = userDAO; // userService;

