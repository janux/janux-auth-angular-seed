'user strict';

var log4js           = require('log4js'),
	_                = require('underscore'),
	PartyServiceImpl = require('janux-persist').PartyServiceImpl,
	UserInvServiceDev 	= require('./user-inv-service.ext.dev'),
	UserInvServiceProd  = require('./user-inv-service.ext.prod'),
	bluebird         = require('bluebird'),
	log = log4js.getLogger('UserInvService'),
	JanuxEnvironmentService = require('janux-persist').EnvironmentService,
	config				  = require('config').serverAppContext;

// variable to hold the singleton instance, if used in that manner
var userInvServiceInstance = undefined;

// var userServicePersistence = undefined;
// var commServicePersistence = undefined;
// var partyServicePersistence = undefined;
var userInvServicePersistence = undefined;

//
// Example of user service
//

var createInstance = function (userInvitationServiceReference) {

	// userServicePersistence = userServiceReference;
	// partyServicePersistence = partyServiceReference;
	// commServicePersistence = commServiceReference;
	userInvServicePersistence = userInvitationServiceReference;

	// var env = JanuxEnvironmentService.getEnvironmentInfo().environment;
	// var env = 'production'; // Needed because we are testing production methods en ops-staging
	// var UserInvServiceExt = (env === 'development') ? UserInvServiceDev : UserInvServiceProd;
	// var that;

	// Constructor
	function UserInvService() {
		// UserInvServiceExt.call(this, userService, partyService, commService, userInvService);
		// that = this;
	}

	// UserInvService.prototype = Object.create(UserInvServiceExt.prototype);
	UserInvService.prototype = Object.create(null);
	UserInvService.prototype.constructor = UserInvService;

	//
	// Exposed methods of user invitation service
	//

	UserInvService.prototype.findOneByCode = function (code, callback) {
		return userInvServicePersistence.findOneByCode(code).asCallback(callback);
	};

	UserInvService.prototype.findOneByAccountId = function (accountId, callback) {
		return userInvServicePersistence.findOneByAccountId(accountId).asCallback(callback);
	};

	UserInvService.prototype.findByAccountIdsIn = function (accountIds, callback) {
		return userInvServicePersistence.findByAccountIdsIn(accountIds).asCallback(callback);
	};

	UserInvService.prototype.update = function (invitation, callback) {
		return userInvServicePersistence.update(invitation).asCallback(callback);
	};

	UserInvService.prototype.deleteById = function (invitationId, callback) {
		return userInvServicePersistence.deleteInvitationById(invitationId).asCallback(callback);
	};

	UserInvService.prototype.recoverPassword = function (accountId, contactId, selectedEmail, callback) {
		// return UserInvServiceExt.prototype.recoverPassword.call(that, accountId, contactId, selectedEmail).asCallback(callback);
		var configObj = {
			selectedEmail: selectedEmail,
			msgSubject: 'Recuperación de contraseña para el sistema Glarus',
			templateUrl: '../server/src/templates/recover-email.pug',
			hostname: config.server.hostname
		};
		return userInvServicePersistence.recoverPassword(accountId, contactId, configObj).asCallback(callback);
	};

	UserInvService.prototype.inviteToCreateAccount = function (contactId, selectedEmail, assignedRoles, callback) {
		// return UserInvServiceExt.prototype.recoverPassword.call(that, accountId, contactId, selectedEmail).asCallback(callback);
		var  configObj = {
			selectedEmail: selectedEmail,
			msgSubject: 'Invitación al sistema de glarus',
			templateUrl: '../server/src/templates/user-invitation.pug',
			hostname: config.server.hostname
		};
		return userInvServicePersistence.inviteToCreateAccount(contactId, assignedRoles, configObj).asCallback(callback);
	};

	// return new UserInvService(userServicePersistence, partyServicePersistence, commServicePersistence, userInvServicePersistence);
	return new UserInvService();
};

module.exports.create = function (UserService, PartyService, CommService, UserInvitationService) {
	// if the instance does not exist, create it
	if (!_.isObject(userInvServiceInstance)) {
		// userInvServiceInstance = new UserService(aDAO);
		userInvServiceInstance = createInstance(UserService, PartyService, CommService, UserInvitationService);
	}
	return userInvServiceInstance;
};

