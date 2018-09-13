/**
 * Project janux-auth-angular-seed
 * Created by hielo on 2018-09-05.
 */
'use strict';

var _ = require('lodash');

module.exports = [ function () {

	var isPassword = /^[a-zA-Z0-9_-]{8,20}$/;
	var isEmail = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

	var service = {

		/**
		 * Validates password strength and match against confirmation if required
		 * @param password The password
		 * @param confirm Optional password confirmation
		 * @returns true if everything is ok or throw error string code
		 */
		password: function (password, confirm) {
			// Check password confirmation
			if (!_.isNil(confirm)) {
				if (password !== confirm) {
					throw 'notMatch';
				}
			}
			// Check password strength
			if (!isPassword.test(password)) {
				throw 'strength';
			}
			return true;
		},

		/**
		 * Validates if the email address meets the format or not
		 * @param email The email address
		 * @returns {boolean} indicating whether the email is valid or not
		 */
		email: function (email) {
			return (isEmail.test(email));
		}
	};
	return service;
}];
