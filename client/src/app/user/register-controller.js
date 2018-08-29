'use strict';

// var Person = require('janux-people').Person;
var PhoneNumber = require('janux-people').PhoneNumber;
var Email = require('janux-people').EmailAddress;
var PostalAddress = require('janux-people').PostalAddress;
var _ = require('lodash');
var md5 = require('md5');

module.exports = ['$scope','$state','dialogService','userInvService','invitation','security','config','userService','$translate','jnxStorage',
		  function($scope , $state , dialogService , userInvService , invitation , security,config,userService,$translate,jnxStorage) {

	var invObj = invitation;
	console.log('invitation', invObj);

	if (_.isNil(invitation)) {
		dialogService.info('user.dialogs.invalidInvitation');
	} else {
		var now = new Date();
		if (invObj.expire < now) {
			dialogService.info('user.dialogs.invitationExpired');
			$state.go('login');
		}
		else if(invObj.status === 'completed') {
			dialogService.info('user.dialogs.invPrevCompl');
			$state.go('login');
		}
		else {
			$scope.user = invObj.account;
			$scope.user.username = '';
			$scope.user.password = '';
			$scope.user.confirmPass = '';

			// Add default phone if needed
			if (_.isNil($scope.user.contact.phoneNumbers())) {
				$scope.user.contact.setContactMethod('HOME', new PhoneNumber());
			}
			// Add default postal address if needed
			if (_.isNil($scope.user.contact.postalAddresses())) {
				$scope.user.contact.setContactMethod('HOME', new PostalAddress());
			}
			// Add default email if needed
			if (_.isNil($scope.user.contact.emailAddresses())) {
				$scope.user.contact.setContactMethod('PERSONAL', new Email());
			}
		}
	}

	// var user = 	{
	// 	username: '',
	// 	password: '',
	// 	confirmPass: '',
	// 	enabled: true
	// };

	$scope.termsAcepted = false;
	$scope.currentNavItem = 'userAccount';

	// Create a new person
	// var person = new Person();
	// person.setContactMethod('HOME', new PhoneNumber());
	// person.setContactMethod('PERSONAL', new Email());
	// person.setContactMethod('HOME', new PostalAddress());

	// user.contact = person;

	$scope.goto = function (tab) {
		// Save invitation + account
		if ($scope.user.username === '') {
			dialogService.info('user.dialogs.userEmpty');
			return;
		} if ($scope.user.password === '') {
			dialogService.info('user.dialogs.passEmpty');
			return;
		} else if ($scope.user.password !== $scope.user.confirmPass) {
			dialogService.info('user.dialogs.passConfMatch');
			return;
		} else if (!$scope.user.password.match(/^[a-zA-Z0-9_-]{8,20}$/)) {
			dialogService.info('user.dialogs.passStrength');
			return;
		}

		$scope.currentNavItem = tab;
	};

	$scope.register = function () {
		if ($scope.termsAcepted) {
			var username = $scope.user.username;
			var password = $scope.user.password;

			invObj.status = 'completed';
			invObj.account = $scope.user;
			invObj.account.enabled = true;
			invObj.account.password = md5(invObj.account.password);
			userInvService.update(invObj).then(function () {
				// User login
				security.login(username, password).then(function(loggedIn) {
					if ( !loggedIn ) {
						// If we get here then the login failed due to bad credentials
						$translate('login.error.invalidCredentials').then( function(msg) {
							$scope.authError = msg;
							$scope.authReason= null;
						});
					}
					else if ($state.current.name === 'register') {
						// $state.go(config.defaultState);
						var storedState = jnxStorage.findItem('glarusState', true);

						userService.findCompanyInfo(username)
							.then(function (result) {
								if (result.id === config.glarus) {
									if (_.isNil(storedState)) {
										$state.go(config.defaultState);
									} else {
										$state.go(storedState.name, storedState.params);
									}
								} else {
									if (_.isNil(storedState)) {
										$state.go(config.defaultStateClient);
									} else {
										$state.go(storedState.name, storedState.params);
									}
								}
							});
					}
				}, function() {
					// If we get here then there was a problem with the login request to the server
					$translate('login.error.serverError').then( function(msg) {
						$scope.authError = msg;
						$scope.authReason= null;
					});
				});
			});
		} else {
			dialogService.info('login.dialogs.termsAndCondErr');
		}
	};
}];
