'use strict';

var Person = require('janux-people').Person;
var PhoneNumber = require('janux-people').PhoneNumber;
var Email = require('janux-people').EmailAddress;
var PostalAddress = require('janux-people').PostalAddress;
var md5 = require('md5');

module.exports = [
'$scope','userService', function(
 $scope , userService ) {

		var user = 	{
			username: '',
			password: '',
			roles: ['WIDGET_DESIGNER']
		};

		// Create a new person
		var person = new Person();
		person.setContactMethod('work', new PhoneNumber());
		person.setContactMethod('work', new Email());
		person.setContactMethod('Home', new PostalAddress());

		user.contact = person;
		$scope.user = user;

		$scope.save = function () {
			console.log('user created', $scope.user);
			$scope.user.password = md5($scope.user.password);
			userService.saveOrUpdate($scope.user).then(function (resp) {
				console.log('User has been saved!', resp);
				window.history.back();
			});
		};

		$scope.cancel = function () {
			window.history.back();
		};
	}];