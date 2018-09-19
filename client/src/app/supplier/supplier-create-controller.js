'use strict';
var Organization = require('janux-people').Organization;
var PhoneNumber = require('janux-people').PhoneNumber;
var Email = require('janux-people').EmailAddress;
var PostalAddress = require('janux-people').PostalAddress;

module.exports = [
	'$scope', 'partyService','validationService','dialogService', function (
		$scope, partyService, validationService , dialogService) {

		// Create a new supplier
		var supplier = new Organization();
		supplier.setContactMethod('work', new PhoneNumber());
		supplier.setContactMethod('work', new Email());
		supplier.setContactMethod('work', new PostalAddress());

		$scope.supplier = supplier;
		console.log('Staff: ', $scope.supplier);

		$scope.addNewAddress = function () {
			$scope.supplier.setContactMethod('work', new PostalAddress());
		};

		$scope.removeAddress = function (z) {
			$scope.supplier.contactMethods.addresses.splice(z, 1);
		};

		$scope.addNewPhone = function () {
			$scope.supplier.setContactMethod('work', new PhoneNumber());
		};

		$scope.removePhone = function (z) {
			$scope.supplier.contactMethods.phones.splice(z, 1);
		};

		$scope.addNewMail = function () {
			$scope.supplier.setContactMethod('work', new Email());
		};

		$scope.removeMail = function (z) {
			$scope.supplier.contactMethods.emails.splice(z, 1);
		};


		$scope.save = function () {
			if (!validationService.everyEmailAddress($scope.supplier.emailAddresses(false))) {
				dialogService.info('party.dialogs.invalidEmail');
				return false;
			}

			console.log('supplier created', $scope.supplier);
			//Adding the falgs.
			$scope.supplier.isSupplier = true;
			partyService.insert($scope.supplier).then(function (resp) {
				console.log('Client has been saved!', resp);
				window.history.back();
			}).catch(function (err) {
				dialogService.info(err, true);
			});
		};

		$scope.cancel = function () {
			window.history.back();
		};

	}];