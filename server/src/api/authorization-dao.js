var	Promise  = require('bluebird');

//  variable to hold the singleton instance, if used in that manner
var authDAOInstance = undefined;

function AuthDAO() { }

AuthDAO.prototype.loadPermissionBits = function(callback) {
	return new Promise(function(resolve,reject) {

		resolve( ['READ', 'UPDATE', 'CREATE', 'DELETE', 'PURGE'] );

	}).nodeify(callback);
};

// Returns a new instance
exports.createInstance = function() {
	return new AuthDAO();
};

// Returns the current stored instance (if it exists) or creates a new instance and stores
exports.singleton = function() {
	// if the singleton has not yet been instantiated, do so
	if ( !_.isObject(authDAOInstance) ) {
		authDAOInstance = new AuthDAO(mongoose);
	}

	return authDAOInstance;
};

// Returns the object that has not yet been instantiated
exports.object = function() {
	return AuthDAO;
};