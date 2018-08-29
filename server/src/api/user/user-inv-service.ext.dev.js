/**
 * Project janux-auth-angular-seed
 * Created by hielo on 2018-08-10
 */
var log4js                = require('log4js'),
	logInvitations        = log4js.getLogger('UserInvitations'),
	log                   = log4js.getLogger('UserInvService'),
	Promise               = require('bluebird'),
	pug 				  = require('pug'),
	randomstring 		  = require("randomstring");

function UserInvService (userServicePersistence, partyServiceRef, commServiceRef, userInvService) {
	this.userServicePersistence = userServicePersistence;
	this.partyService = partyServiceRef;
	this.commService = commServiceRef;
	this.userInvService = userInvService;
}

/**
 * Invite person to create account
 * @param id
 * @param selectedEmail
 * @param assignedRoles
 */
UserInvService.prototype.inviteToCreateAccount = function (id, selectedEmail, assignedRoles, callback) {
	log.debug("Call to inviteToCreateAccount with id %j and email %j", id, selectedEmail);

	return this.partyService.findOne(id).then(function (result) {
		var params = {
			name: result.name.first + ' '+result.name.last,
			email: selectedEmail,
			invitationCode: randomstring.generate({
				length: 12,
				charset: 'alphanumeric'
			})
		};

		var myTemplate = pug.compileFile('../server/src/templates/user-invitation.pug');
		var out = myTemplate(params);

		logInvitations.debug('Invitation for a staff member to create their account ' + out);

		return Promise.resolve(params).asCallback(callback);
	});
};

module.exports = UserInvService;
