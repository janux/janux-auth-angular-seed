'use strict';

var _ = require('lodash');
// var angular = require('angular');

var Person = require('janux-people').Person;
var PhoneNumber = require('janux-people').PhoneNumber;
var Email = require('janux-people').EmailAddress;
var PostalAddress = require('janux-people').PostalAddress;

module.exports = [
	'$scope', 'partyService', 'partyGroupService', 'resourceService', '$state', 'supplier', 'supplierGroup', 'assignableResources', '$modal', '$filter', '$mdDialog', '$mdToast', '$stateParams',
	function ($scope, partyService, partyGroupService, resourceService, $state, supplier, supplierGroup, assignableResources, $modal, $filter, $mdDialog, $mdToast, $stateParams) {

		var contacts = [];
		if (!_.isNil(supplierGroup)) {
			contacts = _.map(supplierGroup.values, function (o) {
				var result = o.party;
				var resource = _.find(assignableResources, function (it) {
					return it.resource.id === result.id;
				});
				result.isAvailable = _.isNil(resource) === false;
				return result;
			});
		}

		// Set current group code of supplier organization
		var supplierGroupCode = (_.isNil(supplierGroup)) ? null : supplierGroup.code;


		console.log('supplier being edited:', supplier, ', group code', supplierGroupCode, ', contacts', contacts);
		$scope.currentNavItem = $stateParams.tab;

		$scope.supplier = supplier;
		$scope.contacts = contacts;
		$scope.editContact = false;
		$scope.addContact = false;
		$scope.editStaff = false;
		$scope.addStaff = false;

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
			if (!_.isNil(supplierGroupCode)) {
				// hide toolbar inside contact template
				$scope.hideContactToolbar = true;

				$scope.currentNavItem = 'contacts';
				$scope.addContact = true;
				$scope.editContact = false;

				// Create a new contact
				var contact = new Person();
				contact.setContactMethod('work', new PhoneNumber());
				contact.setContactMethod('work', new Email());
				contact.setContactMethod('Home', new PostalAddress());
				$scope.contact = contact;
			} else {
				infoDialog('party.dialogs.noContacts');
			}
		};

		var save = function (preventDefault) {
			return partyService.update($scope.supplier).then(function () {
				console.log('Client has been saved!');
				$mdToast.show(
					$mdToast.simple()
						.textContent($filter('translate')('supplier.dialogs.supplierSaved'))
						.position('top right')
						.hideDelay(3000)
				);
				if (!preventDefault) {
					window.history.back();
				}
			});
		};
		$scope.save = save;

		var checkClientDataBeforeExit = function () {
			if ($scope.currentNavItem === 'supplier' && $scope.supplierForm.$dirty) {
				console.error('Unsaved changes');

				return $modal.open({
					templateUrl: 'app/dialog-tpl/save-dialog.html',
					controller : ['$scope', '$modalInstance',
						function ($scope, $modalInstance) {
							$scope.message = $filter('translate')('supplier.dialogs.unsavedClient');

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
			} else {
				return {result: false};
			}
		};


		var saveContact = function (preventDefault) {
			// Validate first and last name
			if ($scope.contact.name.first === '' || _.isNil($scope.contact.name.first)) {
				infoDialog('party.dialogs.contactNameEmpty');
				return;
			} else if ($scope.contact.name.last === '' || _.isNil($scope.contact.name.last)) {
				infoDialog('party.dialogs.contactLastNameEmpty');
				return;
			}

			if ($scope.editContact) {
				// Save supplier contact
				partyService.update($scope.contact).then(function (result) {
					console.log('supplier contact saved', result);
					$mdToast.show(
						$mdToast.simple()
							.textContent($filter('translate')('party.dialogs.contactSaved'))
							.position('top right')
							.hideDelay(3000)
					);
					if (!preventDefault) {
						$state.go('supplier.edit', {id: supplier.id, tab: 'contacts'}, {reload: true});
					}
				});
			} else if ($scope.addContact) {
				// Insert supplier contact
				partyGroupService.addItemNewParty(supplierGroupCode, $scope.contact, {})
					.then(function (result) {
						console.log('Client contact inserted', result);
						$mdToast.show(
							$mdToast.simple()
								.textContent($filter('translate')('supplier.dialogs.supplierContactCreated'))
								.position('top right')
								.hideDelay(3000)
						);
						if (!preventDefault) {
							$state.go('supplier.edit', {id: supplier.id, tab: 'contacts'}, {reload: true});
						}
					});
			}
		};
		$scope.saveContact = saveContact;

		var checkClientContactBeforeExit = function () {
			if ($scope.editContact && $scope.contactForm.$dirty) {
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
			} else {
				return {result: false};
			}
		};

		$scope.changeTab = function (tab) {
			var saveClientContactDialogResult;
			var saveClientDialogResult;
			switch (tab) {
				case 'supplier':
					// Possibly supplier contact editing taking place
					saveClientContactDialogResult = checkClientContactBeforeExit().result;
					if (saveClientContactDialogResult) {
						saveClientContactDialogResult.then(function (res) {
							// Saved or not
							if (res) {
								$state.go('supplier.edit', {id: supplier.id, tab: 'supplier'}, {reload: true});
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
					// Possibly supplier data editing taking place
					saveClientDialogResult = checkClientDataBeforeExit().result;
					if (saveClientDialogResult) {
						saveClientDialogResult.then(function (res) {
							if (res) {
								$scope.supplierForm.$setPristine();
								$scope.currentNavItem = 'contacts';
								// cancel current contact editing
								$scope.editContact = false;
								$scope.addContact = false;
								$scope.editStaff = false;
								$scope.addStaff = false;
							} else {
								$scope.currentNavItem = 'supplier';
							}
						});
					}
					break;

				case 'supplierStaff':
					// Possibly supplier data editing taking place
					saveClientDialogResult = checkClientDataBeforeExit().result;
					if (saveClientDialogResult) {
						saveClientDialogResult.then(function (res) {
							if (res) {
								$scope.supplierForm.$setPristine();
								$scope.currentNavItem = 'contacts';
								// cancel current contact editing
								$scope.editContact = false;
								$scope.addContact = false;
								$scope.editStaff = false;
								$scope.addStaff = false;
							} else {
								$scope.currentNavItem = 'supplierStaff';
							}
						});
					}
					break;
			}
		};

		$scope.cancel = function () {
			// If we are in the supplier tab
			var saveContactDialogResult = checkClientDataBeforeExit().result;
			if ($scope.currentNavItem === 'supplier' && saveContactDialogResult) {
				saveContactDialogResult.then(function (res) {
					if (res) {
						// window.history.back();
						$state.go('supplier.list');
					}
				});
			} else {
				$state.go('supplier.list');
			}
		};

		$scope.cancelEditContact = function () {
			var saveContactDialogResult = checkClientContactBeforeExit().result;
			if (saveContactDialogResult) {
				saveContactDialogResult.then(function (res) {
					if (res) {
						// $scope.currentNavItem='contacts';
						// $scope.editContact=false;
						// $scope.addContact=false;
						if ($scope.currentNavItem === 'contacts') {
							$state.go('supplier.edit', {id: supplier.id, tab: 'contacts'}, {reload: true});
							console.log('Cancel contact edit');
						}

					}
				});
			} else {
				$state.go('supplier.edit', {id: supplier.id, tab: 'contacts'}, {reload: true});
			}
		};

		$scope.editClientContact = function (contactId) {
			// hide toolbar inside contact template
			$scope.hideContactToolbar = true;

			partyService.findOne(contactId).then(function (response) {
				$scope.currentNavItem = 'contacts';
				$scope.editContact = true;
				$scope.addContact = false;
				$scope.contact = response;
				console.log('$scope.contact', $scope.contact);
			});
		};

		$scope.editClientStaff = function (contactId) {
			// hide toolbar inside contact template
			$scope.hideContactToolbar = true;

			partyService.findOne(contactId).then(function (response) {
				$scope.currentNavItem = 'supplierStaff';
				$scope.editStaff = true;
				$scope.addStaff = false;
				$scope.contact = response;
				console.log('$scope.contact', $scope.contact);
			});
		};

		// Disable selected supplier's contacts
		$scope.disableSelectedContacts = function () {

			var selectedContacts = _.chain($scope.contacts)
				.filter({selected: true})
				.map('id')
				.value();

			if (selectedContacts.length > 0) {
				$modal.open({
					templateUrl: 'app/dialog-tpl/confirm-dialog.html',
					controller : ['$scope', '$modalInstance',
						function ($scope, $modalInstance) {
							$scope.message = $filter('translate')('supplier.dialogs.confirmDeletion');

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
								// 			.textContent($filter('translate')('supplier.dialogs.successDeletedContacts'))
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
				infoDialog('supplier.dialogs.noRowSelectedError');
			}
		};

		$scope.switchAvailability = function (available, idParty) {
			if (available === false) {
				// Remove the resource.
				var resourceToRemove = _.find(assignableResources, function (o) {
					return o.resource.id === idParty;
				});

				if (_.isNil(resourceToRemove) === false) {
					// Remove the resource.
					resourceService.removeByIdsWithValidation([resourceToRemove.id])
						.then(function () {
							$scope.refreshResources();
						});
				}
			} else {
				// For the moment the type is guard. Later maybe allow the user to chose
				// The capabilities of the resource.
				var newResource = {
					type      : 'GUARD',
					resource  : _.find($scope.contacts, function (o) {
						return o.id === idParty;
					}),
					vendor    : $scope.supplier,
					assignable: true
				};

				resourceService.insertMany([newResource])
					.then(function (result) {
						console.log('inserted resources: ' + JSON.stringify(result));
						$scope.refreshResources();
					});
			}
		};

		$scope.refreshResources = function () {
			resourceService.findAvailableResourcesByVendor($scope.supplier.id)
				.then(function (resources) {
					assignableResources = resources;
					$scope.contacts.forEach(function (contactRecord) {
						var resource = _.find(resources, function (it) {
							return it.resource.id === contactRecord.id;
						});
						contactRecord.isAvailable = _.isNil(resource) === false;
					});
				});
		};
	}];