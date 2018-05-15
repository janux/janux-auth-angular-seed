/**
 * Project janux-auth-angular-seed
 * Created by ernesto on 9/22/17.
 */
'use strict';
var config = require('config').serverAppContext;
var moment = require('moment-timezone');
var _ = require('lodash');
var partyGroupService = require('../api/services').PartyGroupPersistenceService;
const jwt = require('jsonwebtoken');
const log4js = require('log4js');
const log = log4js.getLogger('PartyService');
const expressJwt = require('express-jwt');
const severTimeZone = moment.tz.guess();
const DEFAULT_TIME_ZONE = 'America/Mexico_City';
const ATTRIBUTE_PARTY_OWNER = '____partyOwnerId';
var zone = moment.tz.zone(DEFAULT_TIME_ZONE);


/**
 * Generates a new token based on the user info
 * @param user
 * @return {*}
 */
function generateToken(user) {

	const now = moment();
	const expiration = moment().hour(3);
	// Remove password
	user.password = undefined;
	if (expiration.date() === now.date()) {
		expiration.add(1, 'days');
	}

	const expirationTimeZoned = localize(expiration);
	const durationSeconds = Math.round(moment.duration(expirationTimeZoned.diff(now)).asSeconds());
	// console.log(now.format());
	// console.log(expirationTimeZoned.format());
	// console.log(" duration seconds" + durationSeconds);
	return partyGroupService.findByTypeAndPartyItem('COMPANY_CONTACTS', user.contactId)
		.then(function (result) {
			var selectedGroup = undefined;
			var parentOrganizationId;
			if (result.length > 1) {
				log.warn("The contact %j , is associated with more than one group. Using the first group", user.contactId);
				selectedGroup = result[0];
			} else if (result.length === 1) {
				selectedGroup = result[0];
			}
			if (_.isNil(selectedGroup) === false) {
				parentOrganizationId = selectedGroup.attributes[ATTRIBUTE_PARTY_OWNER];
				user.parentOrganizationId = parentOrganizationId;
				return jwt.sign(user, config.server.secret, {
					expiresIn: durationSeconds
				});
			} else {
				return jwt.sign(user, config.server.secret, {
					expiresIn: durationSeconds
				});
			}
		});
}

/**
 * This method handles a correct token auth.
 * @type {middleware}
 */
const authenticate = expressJwt({
	secret: config.server.secret
});

/**
 * This method helps to return a 401 in case of no token or if the token is invalid.
 * @param err
 * @param req
 * @param res
 * @param next
 */
function handleInvalidTokenAuth(err, req, res, next) {
	if (err.name === 'UnauthorizedError') {
		res.status(401).send('invalid token...');
	} else {
		next();
	}
}

function localize(date) {
	if (date == null) {
		return undefined;
	}
	if (severTimeZone === DEFAULT_TIME_ZONE) {
		return date;
	} else {
		const minutesOffset = zone.utcOffset(date.valueOf());
		return moment(date).subtract(minutesOffset, "minutes");
	}
}

module.exports = {
	generateToken         : generateToken,
	authenticate          : authenticate,
	handleInvalidTokenAuth: handleInvalidTokenAuth
};