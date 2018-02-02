'use strict';
var Person = require('janux-people').Person;
var PhoneNumber = require('janux-people').PhoneNumber;
var Email = require('janux-people').EmailAddress;
var PostalAddress = require('janux-people').PostalAddress;

module.exports = [
'$scope','partyService', 'partyGroupService', function(
 $scope , partyService , partyGroupService) {

 		// Create a new staff
		var staff = new Person();
		staff.setContactMethod('work', new PhoneNumber());
		staff.setContactMethod('work', new Email());
		staff.setContactMethod('Home', new PostalAddress());

		$scope.staff = staff;
		console.log('Staff: ',$scope.staff);

		$scope.addNewAddress = function() {
		    $scope.staff.setContactMethod('work', new PostalAddress());
		};

		$scope.removeAddress = function(z) {
		    $scope.staff.contactMethods.addresses.splice(z,1);
		};

		$scope.addNewPhone = function() {
			$scope.staff.setContactMethod('work', new PhoneNumber());
		};

		$scope.removePhone = function(z) {
		    $scope.staff.contactMethods.phones.splice(z,1);
		};

		$scope.addNewMail = function() {
		    $scope.staff.setContactMethod('work', new Email());
		};

		$scope.removeMail = function(z) {
		    $scope.staff.contactMethods.emails.splice(z,1);
		};

		$scope.save = function () {
			console.log('user created', $scope.staff);
			// partyService.insert($scope.staff).then(function (resp) {
			// 	console.log('Staff has been saved!', resp);
			// 	window.history.back();
			// });
			partyGroupService.addItemNewParty('glarus_staff_group',$scope.staff,{})
				.then(function (result) {
					console.log('Staff has been saved!', result);
					window.history.back();
				});
		};

		$scope.cancel = function () {
			window.history.back();
		};

	}];