'use strict';
var Person = require('janux-people').Person;
var PhoneNumber = require('janux-people').PhoneNumber;
var Email = require('janux-people').EmailAddress;
var PostalAddress = require('janux-people').PostalAddress;

module.exports = [
'$scope','partyService', function(
 $scope , partyService ) {

	// Create a new staff
	var staff = new Person();
	staff.setContactMethod('work', new PhoneNumber());
	staff.setContactMethod('work', new Email());
	staff.setContactMethod('Home', new PostalAddress());

	$scope.staff = staff;
	$scope.currentNavItem = 'general';

	$scope.save = function () {
		console.log('user created', $scope.staff);
		partyService.insert($scope.staff).then(function (resp) {
			console.log('Staff has been saved!', resp);
			window.history.back();
		});
	};

	$scope.cancel = function () {
		window.history.back();
	};

}];