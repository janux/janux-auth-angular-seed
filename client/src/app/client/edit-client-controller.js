'use strict';

var _ = require('lodash');
// var angular = require('angular');

var Person = require('janux-people').Person;
var PhoneNumber = require('janux-people').PhoneNumber;
var Email = require('janux-people').EmailAddress;
var PostalAddress = require('janux-people').PostalAddress;

module.exports = [
'$scope','partyService','partyGroupService','rateMatrixService','$state','client','clientGroup','rateMatrix','$modal','$filter','$mdDialog','$mdToast','$stateParams', function(
 $scope , partyService , partyGroupService , rateMatrixService , $state , client , clientGroup , rateMatrix , $modal , $filter , $mdDialog , $mdToast , $stateParams) {

	var contacts = [];
	if(!_.isNil(clientGroup)){
		contacts = _.map(clientGroup.values, function (o) {
			return o.party;
		});
	}

	// Set current group code of client organization
	var clientGroupCode = (_.isNil(clientGroup))?null:clientGroup.code;

	console.log('client being edited:', client, ', group code',clientGroupCode, ', contacts', contacts);
	$scope.currentNavItem = $stateParams.tab;

	$scope.client = client;
	$scope.contacts = contacts;
	$scope.editContact = false;
	$scope.addContact = false;
	$scope.rateForm=rateMatrix;

	var infoDialog = function (translateKey) {
		$modal.open({
			templateUrl: 'app/dialog-tpl/info-dialog.html',
			controller : ['$scope', '$modalInstance',
				function ($scope, $modalInstance) {
					$scope.message = $filter('translate')(translateKey);

					$scope.ok = function () {
						$modalInstance.close();
					};
				}],
			size       : 'md'
		});
	};

	$scope.addClientContact = function () {
		if(!_.isNil(clientGroupCode)) {
			// hide toolbar inside contact template
			$scope.hideContactToolbar = true;

			$scope.currentNavItem = 'contacts';
			$scope.addContact = true;
			$scope.editContact = false;

			// Create a new staff
			var contact = new Person();
			contact.setContactMethod('work', new PhoneNumber());
			contact.setContactMethod('work', new Email());
			contact.setContactMethod('Home', new PostalAddress());
			$scope.contact = contact;
		} else {
			infoDialog('party.dialogs.noContacts');
		}
	};

	$scope.updateRateMatrix = function () {

		// Validate info.
		if ($scope.validateRateForm()) {
			rateMatrixService.update($scope.rateForm)
				.then(function () {
					$mdToast.show(
						$mdToast.simple()
							.textContent($filter('translate')('client.dialogs.rateSaved'))
							.position( 'top right' )
							.hideDelay(3000)
					);
				});
		}



	};

	$scope.validateRateForm = function () {
		var keys = Object.keys($scope.rateForm.rates);
		for (var i = 0; i < keys.length; i++) {
			var object = $scope.rateForm.rates[keys[i]];
			if (!_.isNil(object.inputParameters.hoursFullDay) && !_.isNil(object.inputParameters.hoursHalfDay) && object.inputParameters.hoursHalfDay > object.inputParameters.hoursFullDay) {
				infoDialog('client.rates.invalidHours');
				return false;
			}
			if (!_.isNil(object.inputParameters.rateExtraHour) && _.isNil(object.inputParameters.hoursFullDay)) {
				infoDialog('client.rates.missingHoursFullDay');
				return false;
			}
			if (!_.isNil(object.inputParameters.rateMinimum) && _.isNil(object.inputParameters.hoursHalfDay)) {
				infoDialog('client.rates.missingHoursHalfDay');
				return false;
			}

			if ((!_.isNil(object.inputParameters.rateExtraHour) || !_.isNil(object.inputParameters.rateMinimum)) && _.isNil(object.inputParameters.rateDay)){
				infoDialog('client.rates.missingRateDay');
				return false;
			}
		}
		return true;
	};



	var save = function (preventDefault) {
		return partyService.update($scope.client).then(function () {
			console.log('Client has been saved!');
			$mdToast.show(
				$mdToast.simple()
					.textContent($filter('translate')('client.dialogs.clientSaved'))
					.position( 'top right' )
					.hideDelay(3000)
			);
			if(!preventDefault){
				window.history.back();
			}
		});
	};
	$scope.save = save;

	var checkClientDataBeforeExit = function () {
		if($scope.currentNavItem === 'client' && $scope.clientForm.$dirty) {
			console.error('Unsaved changes');

			return $modal.open({
				templateUrl: 'app/dialog-tpl/save-dialog.html',
				controller : ['$scope', '$modalInstance',
					function ($scope, $modalInstance) {
						$scope.message = $filter('translate')('client.dialogs.unsavedClient');

						$scope.save = function () {
							save(true);
							return $modalInstance.close(true);
						};

						$scope.no = function () {
							return $modalInstance.close(true);
						};

						$scope.cancel = function () {
							return $modalInstance.close(false);
							// $modalInstance.close();
							// return false;
						};
					}],
				size       : 'md'
			});
		}else {
			return {result: false};
		}
	};

	var saveContact = function(preventDefault) {
		// Validate first and last name
		if($scope.contact.name.first === '' || _.isNil($scope.contact.name.first)) {
			infoDialog('party.dialogs.contactNameEmpty');
			return;
		}else if($scope.contact.name.last === '' || _.isNil($scope.contact.name.last)) {
			infoDialog('party.dialogs.contactLastNameEmpty');
			return;
		}

		if($scope.editContact) {
			// Save client contact
			partyService.update($scope.contact).then(function (result) {
				console.log('client contact saved', result);
				$mdToast.show(
					$mdToast.simple()
						.textContent($filter('translate')('party.dialogs.contactSaved'))
						.position( 'top right' )
						.hideDelay(3000)
				);
				if(!preventDefault){
					$state.go('client.edit', {id: client.id, tab:'contacts'}, {reload: true});
				}
			});
		} else if($scope.addContact) {
			// Insert client contact
			partyGroupService.addItemNewParty(clientGroupCode,$scope.contact,{})
			.then(function (result) {
				console.log('Client contact inserted', result);
				$mdToast.show(
					$mdToast.simple()
						.textContent($filter('translate')('client.dialogs.clientContactCreated'))
						.position( 'top right' )
						.hideDelay(3000)
				);
				if(!preventDefault){
					$state.go('client.edit', {id: client.id, tab:'contacts'}, {reload: true});
				}
			});
		}
	};
	$scope.saveContact = saveContact;

	var checkClientContactBeforeExit = function () {
		if($scope.editContact && $scope.contactForm.$dirty) {
			console.error('Unsaved changes');
			return $modal.open({
				templateUrl: 'app/dialog-tpl/save-dialog.html',
				controller : ['$scope', '$modalInstance',
					function ($scope, $modalInstance) {
						$scope.message = $filter('translate')('party.dialogs.unsavedContact');

						$scope.save = function () {
							saveContact(true);
							return $modalInstance.close(true);
						};

						$scope.no = function () {
							return $modalInstance.close(true);
						};

						$scope.cancel = function () {
							return $modalInstance.close(false);
						};
					}],
				size       : 'md'
			});
		}else {
			return {result:false};
		}
	};

	$scope.changeTab = function (tab) {
		var saveClientDialogResult;
		switch (tab) {
			case 'client':
				// Possibly client contact editing taking place
				var saveClientContactDialogResult = checkClientContactBeforeExit().result;
				if (saveClientContactDialogResult) {
					saveClientContactDialogResult.then(function (res) {
						// Saved or not
						if (res) {
							$state.go('client.edit', {id: client.id, tab: 'client'}, {reload: true});
						}
						// Canceled
						else {
							$scope.currentNavItem = 'contacts';
						}
					});
				} else {	// No changes
					$scope.editContact = false;
					$scope.addContact = false;
				}
				break;

			case 'contacts':
				// Possibly client data editing taking place
				saveClientDialogResult = checkClientDataBeforeExit().result;
				if (saveClientDialogResult) {
					saveClientDialogResult.then(function (res) {
						if (res) {
							$scope.clientForm.$setPristine();
							$scope.currentNavItem = 'contacts';
							// cancel current contact editing
							$scope.editContact = false;
							$scope.addContact = false;
						} else {
							$scope.currentNavItem = 'client';
						}
					});
				}
				break;
			case 'rates':
				// Possibly client data editing taking place
				saveClientDialogResult = checkClientDataBeforeExit().result;
				if (saveClientDialogResult) {
					saveClientDialogResult.then(function (res) {
						if (res) {
							$scope.clientForm.$setPristine();
							$scope.currentNavItem = 'rates';
							// cancel current contact editing
							$scope.editContact = false;
							$scope.addContact = false;
						} else {
							$scope.currentNavItem = 'client';
						}
					});
				}
				break;
		}
	};

	$scope.cancel = function () {
		// If we are in the client tab
		var saveContactDialogResult = checkClientDataBeforeExit().result;

		if($scope.currentNavItem==='client' && saveContactDialogResult) {
			saveContactDialogResult.then(function (res) {
				if(res) {
					// window.history.back();
					$state.go('client.list');
				}
			});
		}else {
			$state.go('client.list');
		}
	};

	$scope.cancelEditContact = function () {
		var saveContactDialogResult = checkClientContactBeforeExit().result;
		if(saveContactDialogResult) {
			saveContactDialogResult.then(function(res){
				if(res) {
					// $scope.currentNavItem='contacts';
					// $scope.editContact=false;
					// $scope.addContact=false;
					$state.go('client.edit', {id: client.id, tab:'contacts'}, {reload: true});
					console.log('Cancel contact edit');
				}
			});
		}else {
			$state.go('client.edit', {id: client.id, tab:'contacts'}, {reload: true});
		}
	};

	$scope.editClientContact = function(contactId) {
		// hide toolbar inside contact template
		$scope.hideContactToolbar = true;

		partyService.findOne(contactId).then(function(response){
			$scope.currentNavItem='contacts';
			$scope.editContact=true;
			$scope.addContact = false;
			$scope.contact = response;
			console.log('$scope.contact', $scope.contact);
		});
	};

	// Disable selected client's contacts
	$scope.disableSelectedContacts= function () {

		var selectedContacts = _.chain($scope.contacts)
			.filter({selected:true})
			.map('id')
			.value();

		if (selectedContacts.length > 0) {
			$modal.open({
				templateUrl: 'app/dialog-tpl/confirm-dialog.html',
				controller : ['$scope', '$modalInstance',
					function ($scope, $modalInstance) {
						$scope.message = $filter('translate')('client.dialogs.confirmDeletion');

						$scope.ok = function () {
							infoDialog('To be implemented!');

							// Disable contacts
							// var promises = _.map(selectedContacts, function(contactId){
							//
							// 	// TODO: Implement method to disable contacts
							// 	return partyService.remove(contactId);
							// });

							// $q.all(promises).then(function(){
							// 	$mdToast.show(
							// 		$mdToast.simple()
							// 			.textContent($filter('translate')('client.dialogs.successDeletedContacts'))
							// 			.position( 'top right' )
							// 			.hideDelay(3000)
							// 	);
							// });

							$modalInstance.close();
						};

						$scope.cancel = function () {
							$modalInstance.close();
						};
					}],
				size       : 'md'
			});
		} else {
			infoDialog('client.dialogs.noRowSelectedError');
		}
	};
}];