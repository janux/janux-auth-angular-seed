'use strict';
var Person = require('janux-people').Person;
var PhoneNumber = require('janux-people').PhoneNumber;
var Email = require('janux-people').EmailAddress;
var PostalAddress = require('janux-people').PostalAddress;

module.exports = [
	'$scope', 'userService', 'security', 'partyGroupService','dialogService','validationService', function (
		$scope, userService, security, partyGroupService , dialogService, validationService) {

		// Create a new staff
		var staff = new Person();
		staff.setContactMethod('work', new PhoneNumber());
		staff.setContactMethod('work', new Email());
		staff.setContactMethod('Home', new PostalAddress());

		$scope.staff = staff;
		console.log('Staff: ', $scope.staff);

		$scope.save = function () {
			console.log('user created', $scope.staff);

			if (!validationService.everyEmailAddress($scope.staff.emailAddresses(false))) {
				dialogService.info('party.dialogs.invalidEmail');
				return false;
			}

			userService.findCompanyInfo(security.currentUser.username)
				.then(function (result) {
					return partyGroupService.findOneOwnedByPartyAndType(result.id, 'COMPANY_CONTACTS', true);
				})
				.then(function (result) {
					partyGroupService.addItemNewParty(result.code, $scope.staff, {})
						.then(function (result) {
							console.log('Staff has been saved!', result);
							window.history.back();
						}).catch(function (err) {
							dialogService.info(err, true);
						});
				});

		};

		$scope.cancel = function () {
			window.history.back();
		};

	}];
