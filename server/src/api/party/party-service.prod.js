/**
 * Project janux-auth-angular-seed
 * Created by hielo on 2018-08-10
 */
var log4js                = require('log4js'),
	logInvitations        = log4js.getLogger('StaffInvitations'),
	log                   = log4js.getLogger('PartyService'),
	Promise               = require('bluebird');

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
		to: selectedEmail,
		body: 'Email body'
	};

	logInvitations.debug('Sending email width params: ' + JSON.stringify(params));

	this.commService.on(this.commService.events.EMAIL_SUCCESS_SENT_EVENT, function(resp) {
		log.info('Email successfully sent event fired, response ' + JSON.stringify(resp));
	});

	this.commService.sendEmail(params);

	Promise.resolve(params).asCallback(callback);
};

module.exports = PartyService;
