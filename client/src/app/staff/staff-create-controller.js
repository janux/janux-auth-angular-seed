'use strict';
var Person = require('janux-people').Person;
var PhoneNumber = require('janux-people').PhoneNumber;
var Email = require('janux-people').EmailAddress;
var PostalAddress = require('janux-people').PostalAddress;
var _ = require('lodash');

module.exports = [
'$scope','partyService','partyGroupService','dialogService','validationService', function(
 $scope , partyService , partyGroupService , dialogService , validationService) {

 		// Create a new staff
		var staff = new Person();
		staff.setContactMethod('work', new PhoneNumber());
		staff.setContactMethod('work', new Email());
		staff.setContactMethod('Home', new PostalAddress());

		$scope.staff = staff;
		console.log('Staff: ',$scope.staff);

		$scope.save = function () {
			if (!_.isNil($scope.staff.emailAddresses(false)) &&
				$scope.staff.emailAddresses(false).length > 0) {
				if(!_.every($scope.staff.emailAddresses(false), function (email) {
						if (!validationService.email(email.address)) {
							dialogService.info('party.dialogs.invalidEmail');
							return false;
						}
						return true;
					})) {
					return false;
				}
			}

			// console.log('staff about to save', $scope.staff);
			// partyService.insert($scope.staff).then(function (resp) {
			// 	console.log('Staff has been saved!', resp);
			// 	window.history.back();
			// });
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
