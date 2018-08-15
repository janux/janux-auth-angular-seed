/**
 * Project janux-auth-angular-seed
 * Created by hielo on 2018-08-10
 */
var log4js                = require('log4js'),
	logInvitations        = log4js.getLogger('StaffInvitations'),
	log                   = log4js.getLogger('PartyService'),
	Promise               = require('bluebird'),
	pug 				  = require('pug'),
	randomstring = require("randomstring");

function PartyService (commServiceRef) {
	this.commService = commServiceRef;
}

/**
 * Invite person to create account
 * @param id
 * @param selectedEmail
 * @param assignedRoles
 */
PartyService.prototype.inviteToCreateAccount = function (id, selectedEmail, assignedRoles, callback) {
	log.debug("Call to inviteToCreateAccount with id %j and email %j", id, selectedEmail);

	var params = {
		name: 'StaffName',
		email: selectedEmail,
		invitationCode: randomstring.generate({
			length: 12,
			charset: 'alphanumeric'
		})
	};

	var myTemplate = pug.compileFile('../server/src/templates/staff-invitation.pug');
	var out = myTemplate(params);

	logInvitations.debug('Invitation for a staff member to create their account ' + out);

	Promise.resolve(params).asCallback(callback);
};

module.exports = PartyService;
