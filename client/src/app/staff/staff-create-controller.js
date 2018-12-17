'use strict';
var Person = require('janux-people').Person;
var PhoneNumber = require('janux-people').PhoneNumber;
var Email = require('janux-people').EmailAddress;
var PostalAddress = require('janux-people').PostalAddress;
// var _ = require('lodash');

module.exports = [
'$scope','partyService','partyGroupService','dialogService','validationService', function(
 $scope , partyService , partyGroupService , dialogService , validationService) {

 		// Create a new staff
		var staff = new Person();
		staff.setContactMethod('work', new PhoneNumber());
		staff.setContactMethod('work', new Email());
		staff.setContactMethod('Home', new PostalAddress());

		$scope.staff = staff;
		$scope.currentNavItem = 'general';
		console.log('Staff: ',$scope.staff);

		$scope.save = function () {
			$scope.staff = partyService.clean($scope.staff);
			if (!validationService.everyEmailAddress($scope.staff.emailAddresses(false))) {
				dialogService.info('party.dialogs.invalidEmail');
				return false;
			}

			partyGroupService.addItemNewParty('glarus_staff_group',$scope.staff,{})
				.then(function (result) {
					console.log('Staff has been saved!', result);
					window.history.back();
				}).catch(function (err) {
					dialogService.info(err, true);
				});
		};

		$scope.cancel = function () {
			window.history.back();
		};

	}];
