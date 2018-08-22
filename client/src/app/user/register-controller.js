'use strict';

var Person = require('janux-people').Person;
var PhoneNumber = require('janux-people').PhoneNumber;
var Email = require('janux-people').EmailAddress;
var PostalAddress = require('janux-people').PostalAddress;

module.exports = ['$scope','dialogService', function($scope, dialogService) {
	var user = 	{
		username: '',
		password: '',
		confirmPass: '',
		enabled: true
	};

	$scope.termsAcepted = false;
	$scope.currentNavItem = 'userAccount';

	// Create a new person
	var person = new Person();
	person.setContactMethod('HOME', new PhoneNumber());
	person.setContactMethod('PERSONAL', new Email());
	person.setContactMethod('HOME', new PostalAddress());

	user.contact = person;
	$scope.user = user;

	$scope.goto = function (tab) {
		$scope.currentNavItem = tab;
	};

	$scope.register = function () {
		// TODO: link account to person
		if ($scope.termsAcepted) {

		} else {
			dialogService.info('login.dialogs.termsAndCondErr');
		}
	};
}];