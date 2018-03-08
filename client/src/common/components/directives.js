"use strict";

var Person = require('janux-people').Person;
var PhoneNumber = require('janux-people').PhoneNumber;
var Email = require('janux-people').EmailAddress;
var PostalAddress = require('janux-people').PostalAddress;

var scopeDefinition = { "data":"=", "section":"@" };

angular.module('commonComponents',[])

.directive('user', function() {
	var userComponentScope = scopeDefinition;
	userComponentScope.password = "<";
	return{
		scope: scopeDefinition,
		restrict:'E',
		templateUrl: 'common/components/templates/user.html'
	};
})

.directive('userRoles', function() {
	return{
		scope: scopeDefinition,
		restrict:'E',
		templateUrl: 'common/components/templates/user-roles.html'
	};
})

.directive('personName', function() {
	return{
		scope: scopeDefinition,
		restrict:'E',
		templateUrl: 'common/components/templates/person-name.html'
	};
})
.directive('personJob', function() {
	return{
		scope: scopeDefinition,
		restrict:'E',
		templateUrl: 'common/components/templates/person-job.html'
	};
})

.directive('organization', function() {
	return{
		scope: scopeDefinition,
		restrict:'E',
		templateUrl: 'common/components/templates/organization.html'
	};
})

.directive('phones', function() {
	return{
		scope: scopeDefinition,
		restrict:'E',
		templateUrl: 'common/components/templates/phones.html',
		controller: function ($scope) {
			$scope.addNewPhone = function() {
				$scope.data.setContactMethod('work', new PhoneNumber());
			};

			$scope.removePhone = function(z) {
				$scope.data.contactMethods.phones.splice(z,1);
			};
		}
	};
})
.directive('emails', function() {
	return{
		scope: scopeDefinition,
		restrict:'E',
		templateUrl: 'common/components/templates/emails.html',
		controller: function ($scope) {
			$scope.addNewMail = function() {
				$scope.data.setContactMethod('work', new Email());
			};

			$scope.removeMail = function(z) {
				$scope.data.contactMethods.emails.splice(z,1);
			};
		}
	};
})
.directive('addresses', function() {
	return{
		scope: scopeDefinition,
		restrict:'E',
		templateUrl: 'common/components/templates/addresses.html',
		controller: function ($scope) {
			$scope.addNewAddress = function() {
				$scope.data.setContactMethod('work', new PostalAddress());
			};

			$scope.removeAddress = function(z) {
				$scope.data.contactMethods.addresses.splice(z,1);
			};
		}
	};
})

.directive('specialService', function() {
	var specialServiceScope = scopeDefinition;
	specialServiceScope.cl = "=";
	specialServiceScope.disabled = "<";

	return{
		scope: specialServiceScope,
		restrict:'E',
		templateUrl: 'common/components/templates/special-service.html',
		controller: ['$scope','resourceService','partyGroupService','$rootScope','$mdDialog','$mdToast', '$modal','$filter',
			function ($scope, resourceService, partyGroupService, $rootScope, $mdDialog, $mdToast, $modal, $filter) {

			var clientGroupCode = '';
			var clientContacts = [];
			var staff = [];
			var vehicles = [];

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

			resourceService.findAvailableResources().then(function (resources) {
				// console.log('resources', resources);

				// Filter only persons and resources that belongs to glarus.
				staff = _.filter(resources, function (o) {
					return o.type !== 'VEHICLE' && o.vendor.id === '10000';
				});

				// Filter vehicles only
				vehicles = _.filter(resources, function (o) {
					return o.type === 'VEHICLE';
				});
				console.log('vehicles', vehicles);
			});

			// Client
			function createFilterForClient(query) {
				return function filterFn(client) {
					var name = client.name.toLowerCase()
						.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
					var contains = name.toLowerCase().includes(query.toLowerCase());
					return contains;
				};
			}

			$scope.clientSearch = function (query) {
				return query ? $scope.cl.filter(createFilterForClient(query)) : $scope.cl;
			};

			$scope.clientSelectedItemChange = function (item) {

				if(!_.isNil(item)) {
					partyGroupService.findOneOwnedByPartyAndType(item.id, 'COMPANY_CONTACTS')
					.then(function (result) {
						// Set current group code of client organization
						clientGroupCode = (_.isNil(result))?null:result.code;
						if(!_.isNil(result)) {

							var parties = _.map(result.values, function (o) {
								return o.party;
							});
							clientContacts = parties;
							console.log('clientContacts',clientContacts);
						} else {
							clientContacts = [];
							infoDialog('operations.dialogs.noContacts');
						}
					});
				}
			};

			// Requester
			function createFilterForRequester(query) {
				return function filterFn(interestedParty) {
					var name = (interestedParty.name.last + ' ' + interestedParty.name.first).toLowerCase()
						.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
					var contains = name.toLowerCase().includes(query.toLowerCase());
					return contains;
				};
			}

			$scope.requesterSearch = function (query) {
				var out = query ? clientContacts.filter(createFilterForRequester(query)) : clientContacts;
				return out.concat( [ {
					addOption:true
				} ] );
			};

			$scope.requesterSelectedItemChange = function (item) {
				if (item) {
					if (item.addOption) {
						createContact('Requester');
					}
				}
			};

			// Principals
			function createFilterForPrincipal(query) {
				return function filterFn(principal) {
					var name = (principal.name.last + ' ' + principal.name.first).toLowerCase()
						.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
					var contains = name.toLowerCase().includes(query.toLowerCase());
					return contains;
				};
			}

			$scope.principalSearch = function (query) {
				var out = query ?  clientContacts.filter(createFilterForPrincipal(query)) : clientContacts;
				return out.concat([ {
					addOption:true
				} ]);
			};

			$scope.principalSelectedItemChange = function (item) {
				if (item) {
					if (item.addOption) {
						createContact('Principal');
					}
				}
			};

			$scope.addPrincipal= function() {
				$scope.data.principals.push({object:'',search:''});
			};

			$scope.removePrincipal = function(z) {
				$scope.data.principals.splice(z,1);
			};

			// Staff
			function createFilterForStaff(query) {
				return function filterFn(opStaff) {
					var resource = opStaff.resource;
					var name = (resource.name.last + ' ' + resource.name.first).toLowerCase()
						.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
					var contains = name.toLowerCase().includes(query.toLowerCase());
					return contains;
				};
			}

			$scope.staffSearch = function (query) {
				return query ? staff.filter(createFilterForStaff(query)) : staff;
			};

			$scope.addStaff= function() {
				$scope.data.staff.push({object:'',search:''});
			};

			$scope.removeStaff = function(z) {
				$scope.data.staff.splice(z,1);
			};

			// Vehicles
			function createFilterForVehicles(query) {
				return function filterFn(opVehicle) {
					var resource = opVehicle.resource;
					var name = (resource.name + ' ' + resource.name.plateNumber).toLowerCase()
						.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
					var contains = name.toLowerCase().includes(query.toLowerCase());
					return contains;
				};
			}

			$scope.vehicleSearch = function (query) {
				return query ? vehicles.filter(createFilterForVehicles(query)) : vehicles;
			};

			$scope.addVehicle= function() {
				$scope.data.vehicles.push({object:'',search:''});
			};

			$scope.removeVehicle = function(z) {
				$scope.data.vehicles.splice(z,1);
			};

			// Markdown editor
			$scope.fullScreenPreview = function() {
				$rootScope.markdownEditorObjects.specialOpsDescription.showPreview();
				$rootScope.markdownEditorObjects.specialOpsDescription.setFullscreen(true);
			};

			$scope.onFullScreenCallback = function(e) {
				e.showPreview();
			};

			$scope.onFullScreenExitCallback = function(e) {
				e.hidePreview();
			};

			var refreshClientContactsList = function () {
				if($scope.data.client.object) {
					$scope.clientSelectedItemChange($scope.data.client.object);
				}
			};

			// Add principal dialog
			var createContact = function (type) {
				$mdDialog.show({
					controller: ['$scope', function($scope ) {

						// Create a new staff
						var principal = new Person();
						principal.setContactMethod('work', new PhoneNumber());
						principal.setContactMethod('work', new Email());
						principal.setContactMethod('Home', new PostalAddress());

						$scope.principal = principal;
						$scope.type = type;

						$scope.save = function() {
							if(!_.isNil(clientGroupCode)) {
								console.log('clientGroupCode', clientGroupCode);
								// Insert principal
								partyGroupService.addItemNewParty(clientGroupCode,$scope.principal,{})
								.then(function (result) {
									console.log('Principal inserted', result);
									$mdToast.show(
										$mdToast.simple()
											.textContent($filter('translate')('operations.dialogs.principalCreated'))
											.position( 'top right' )
											.hideDelay(3000)
									);
									refreshClientContactsList($scope.principal);
									$mdDialog.cancel();
								});
							} else {
								infoDialog('operations.dialogs.noContacts');
							}
						};

						$scope.cancel = function() {
							$mdDialog.cancel();
						};
					}],
					templateUrl: 'common/components/templates/add-contact.html',
					parent: angular.element(document.body),
					clickOutsideToClose: true
				});
			};
		}]
	};
});