'user strict';

var log4js           = require('log4js'),
	_                = require('underscore'),
	PartyServiceImpl = require('janux-persist').PartyServiceImpl,
	UserInvServiceDev 	= require('./user-inv-service.ext.dev'),
	UserInvServiceProd  = require('./user-inv-service.ext.prod'),
	// env 		     = express().settings.env;
	env 			 = 'production',
	bluebird         = require('bluebird'),
	log = log4js.getLogger('UserInvService');

// variable to hold the singleton instance, if used in that manner
var userInvServiceInstance = undefined;

var userServicePersistence = undefined;
var commServicePersistence = undefined;
var partyServicePersistence = undefined;
var userInvServicePersistence = undefined;

//
// Example of user service
//

var createInstance = function (userServiceReference, partyServiceReference, commServiceReference, userInvitationServiceReference) {

	userServicePersistence = userServiceReference;
	partyServicePersistence = partyServiceReference;
	commServicePersistence = commServiceReference;
	userInvServicePersistence = userInvitationServiceReference;

	// TODO: Move method logic to janux-persist
	var UserInvServiceExt = (env === 'development') ? UserInvServiceDev : UserInvServiceProd;
	var that;

	// Constructor
	function UserInvService(userService, partyService, commService, userInvService) {
		UserInvServiceExt.call(this, userService, partyService, commService, userInvService);
		that = this;
	}

	UserInvService.prototype = Object.create(UserInvServiceExt.prototype);
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
		return UserInvServiceExt.prototype.recoverPassword.call(that, accountId, contactId, selectedEmail).asCallback(callback);
	};

	return new UserInvService(userServicePersistence, partyServicePersistence, commServicePersistence, userInvServicePersistence);
};

module.exports.create = function (UserService, PartyService, CommService, UserInvitationService) {
	// if the instance does not exist, create it
	if (!_.isObject(userInvServiceInstance)) {
		// userInvServiceInstance = new UserService(aDAO);
		userInvServiceInstance = createInstance(UserService, PartyService, CommService, UserInvitationService);
	}
	return userInvServiceInstance;
};

