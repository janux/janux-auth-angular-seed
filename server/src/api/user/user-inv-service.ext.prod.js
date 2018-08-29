/**
 * Project janux-auth-angular-seed
 * Created by hielo on 2018-08-10
 */
var log4js                = require('log4js'),
	logInvitations        = log4js.getLogger('UserInvitations'),
	log                   = log4js.getLogger('UserInvService'),
	md5         		  = require('md5'),
	moment 				  = require('moment'),
	pug 				  = require('pug'),
	randomstring 		  = require("randomstring"),
	_					  = require("lodash"),
	Promise				  = require("bluebird");

function UserInvService (userServiceRef, partyServiceRef, commServiceRef, userInvService) {
	this.userServicePersistence = userServiceRef;
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
	log.info("Call to inviteToCreateAccount with id %j and email %j", id, selectedEmail);

	var that = this;

	// Template variables
	var params = {
		name: '',
		email: selectedEmail,
		invitationCode: randomstring.generate({
			length: 12,
			charset: 'alphanumeric'
		})
	};

	return this.partyService.findOne(id).then(function (result) {
		params.name = result.name.first + ' ' + result.name.last;

		// Compile template
		var myTemplate = pug.compileFile('../server/src/templates/user-invitation.pug');
		var out = myTemplate(params);

		logInvitations.debug('Sending invitation email width params: ' + JSON.stringify(params));

		// Adding email sent event listener
		that.commService.on(that.commService.events.EMAIL_SUCCESS_SENT_EVENT, function(resp) {
			log.info('Invitation Email successfully sent ' + out);
			logInvitations.debug('Invitation for a staff member to create their account ' + out);
		});

		// Create account with random values
		var account = {
			userId: id,
			enabled: true,
			username: 'xxxx-' + randomstring.generate({
				length: 12,
				charset: 'alphanumeric'
			}),
			password: md5(randomstring.generate({
				length: 12,
				charset: 'alphanumeric'
			})),
			locked: false,
			roles: assignedRoles,
			contact: {id: id}
		};

		var emailParams = {
			to: selectedEmail,
			subject: 'Invitación al sistema de glarus',
			text: out,
			html: out
		};

		// Send email in an asynchronous way
		that.commService.sendEmail(emailParams);

		return that.userServicePersistence.findOneByContactId(id).then(function (accountFound) {
			if (_.isNil(accountFound)) {
				return that.userServicePersistence.insert(account);
			} else {
				return accountFound;
			}
		});
	}).then(function (result) {
		log.info('Creating account ' + JSON.stringify(result));

		// Insert invitation
		var invitation = {
			accountId: result.userId,
			code: params.invitationCode,
			expire: moment().add(5, 'days').toDate(),
			status: 'pending'
		};

		return that.userInvService.findOneByAccountId(result.userId).then(function (invFound) {
			if (_.isNil(invFound)) {
				return that.userInvService.insert(invitation).asCallback(callback);
			} else {
				var invReturn = null;
				switch (invFound.status) {
					case 'pending':
						// Update expire and code date of the invitation
						invFound.code = invitation.code;
						invFound.expire = invitation.expire;
						log.info('Invitation found ' + JSON.stringify(invFound));
						invReturn = that.userInvService.update(invFound, true).asCallback(callback);
						break;
					case 'completed':
						invReturn = Promise.resolve(invFound).asCallback(callback);
						break;
				}
				return invReturn;
			}
		});
	});
};

module.exports = UserInvService;
