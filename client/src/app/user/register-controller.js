'use strict';

// var Person = require('janux-people').Person;
var PhoneNumber = require('janux-people').PhoneNumber;
var Email = require('janux-people').EmailAddress;
var PostalAddress = require('janux-people').PostalAddress;
var _ = require('lodash');

module.exports = ['$scope','$state','dialogService','userInvService','invitation',
		  function($scope , $state , dialogService , userInvService , invitation ) {

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
		$scope.currentNavItem = tab;
	};

	$scope.register = function () {
		// Save invitation + account
		if ($scope.termsAcepted) {
			invObj.status = 'completed';
			invObj.account = $scope.user;
			userInvService.update(invObj);

			// TODO: user login
		} else {
			dialogService.info('login.dialogs.termsAndCondErr');
		}
	};
}];
