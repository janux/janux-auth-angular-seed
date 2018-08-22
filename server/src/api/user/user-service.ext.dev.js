/**
 * Project janux-auth-angular-seed
 * Created by hielo on 2018-08-10
 */
var log4js                = require('log4js'),
	logInvitations        = log4js.getLogger('UserInvitations'),
	log                   = log4js.getLogger('UserService'),
	Promise               = require('bluebird'),
	pug 				  = require('pug'),
	randomstring 		  = require("randomstring");

function UserService (commServiceRef) {
	this.commService = commServiceRef;
}

/**
 * Invite person to create account
 * @param id
 * @param selectedEmail
 * @param assignedRoles
 */
UserService.prototype.inviteToCreateAccount = function (id, selectedEmail, assignedRoles, callback) {
	log.debug("Call to inviteToCreateAccount with id %j and email %j", id, selectedEmail);

	var params = {
		name: 'StaffName',
		email: selectedEmail,
		invitationCode: randomstring.generate({
			length: 12,
			charset: 'alphanumeric'
		})
	};

	var myTemplate = pug.compileFile('../server/src/templates/user-invitation.pug');
	var out = myTemplate(params);

	logInvitations.debug('Invitation for a staff member to create their account ' + out);

	Promise.resolve(params).asCallback(callback);
};

module.exports = UserService;
