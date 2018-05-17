/**
 * Project janux-auth-angular-seed
 * Created by ernesto on 9/22/17.
 */
'use strict';
var config = require('config').serverAppContext;
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');


/**
 * Generates a new token based on the user info
 * @param user
 * @return {*}
 */
function generateToken(user) {

	var tokenInfo = {};
	tokenInfo.username = user.username;
	tokenInfo.roles = user.roles;
	tokenInfo.contact = user.contact;
	tokenInfo.contact.id = undefined;
	return jwt.sign(tokenInfo, config.server.secret, {
		expiresIn: "48h"
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


module.exports = {
	generateToken         : generateToken,
	authenticate          : authenticate,
	handleInvalidTokenAuth: handleInvalidTokenAuth
};