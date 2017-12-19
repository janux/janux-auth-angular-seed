/**
 * Project janux-auth-angular-seed
 * Created by ernesto on 9/22/17.
 */
'use strict';
var config = require('config').serverAppContext;

//const TOKEN_TIME = 120 * 60; // in seconds

const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');

/**
 * Generates a new token based on the user info
 * @param user
 * @return {*}
 */
function generateToken(user) {

	const now = new Date();
	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);
	//Setting expiration date at 3 am of the next day.
	const expirationDate = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 3, 0, 0, 0);
	// console.log("now : " + now + "tomo: " + tomorrow + " expirationDate: " + expirationDate);
	const expirationSeconds = expirationDate.getTime() - now.getTime();
	// console.log("Setting " + expirationSeconds + " seconds");
	return jwt.sign(user, config.server.secret, {
		expiresIn: expirationSeconds
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
	generateToken: generateToken,
	authenticate: authenticate,
	handleInvalidTokenAuth: handleInvalidTokenAuth
};