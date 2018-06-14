"use strict";

var Person = require('janux-people').Person;
var PhoneNumber = require('janux-people').PhoneNumber;
var Email = require('janux-people').EmailAddress;
var PostalAddress = require('janux-people').PostalAddress;

var scopeDefinition = {"data": "=", "section": "@"};

var infoDialog = function (translateKey, $modal, $filter) {
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

angular.module('commonComponents', [])

	.directive('user', function () {
		var userComponentScope = scopeDefinition;
		userComponentScope.password = "<";
		return {
			scope      : scopeDefinition,
			restrict   : 'E',
			templateUrl: 'common/components/templates/user.html'
		};
	})

	.directive('userRoles', function () {
		return {
			scope      : scopeDefinition,
			restrict   : 'E',
			templateUrl: 'common/components/templates/user-roles.html'
		};
	})

	.directive('personName', function () {
		return {
			scope      : scopeDefinition,
			restrict   : 'E',
			templateUrl: 'common/components/templates/person-name.html'
		};
	})
	.directive('personJob', function () {
		var jobComponentScope = scopeDefinition;
		jobComponentScope.externalflag = "<";

		var checkStaff = function ($scope) {
			if (!_.isNil($scope.data)) {
				if (_.isNil($scope.data.staff) && $scope.externalflag) {
					$scope.data.staff = {
						isExternal: false
					};
				} else if (_.isNil($scope.data.staff) && !$scope.externalflag) {
					$scope.data.staff = {
						isExternal: false
					};
				}
			}
		};

		return {
			scope      : jobComponentScope,
			restrict   : 'E',
			templateUrl: 'common/components/templates/person-job.html',
			controller : ['$scope', function ($scope) {
				checkStaff($scope);
			}],
			link       : function (scope) {
				// console.log('scope.data', scope.data);
				scope.$watch('data.name', function (newValue, oldValue) {
					if (newValue) {
						checkStaff(scope);
					}
				}, true);
			}
		};
	})

	.directive('organization', function () {
		return {
			scope      : scopeDefinition,
			restrict   : 'E',
			templateUrl: 'common/components/templates/organization.html'
		};
	})

	.directive('phones', function () {
		return {
			scope      : scopeDefinition,
			restrict   : 'E',
			templateUrl: 'common/components/templates/phones.html',
			controller : function ($scope) {
				$scope.phoneTypes = ['HOME', 'WORK', 'MOBILE', 'FAX', 'OTHER'];

				$scope.addNewPhone = function () {
					$scope.data.setContactMethod('work', new PhoneNumber());
				};

				$scope.removePhone = function (z) {
					$scope.data.contactMethods.phones.splice(z, 1);
				};
			}
		};
	})
	.directive('emails', function () {
		return {
			scope      : scopeDefinition,
			restrict   : 'E',
			templateUrl: 'common/components/templates/emails.html',
			controller : function ($scope) {
				$scope.mailTypes = ['PERSONAL', 'WORK', 'OTHER'];

				$scope.addNewMail = function () {
					$scope.data.setContactMethod('work', new Email());
				};

				$scope.removeMail = function (z) {
					$scope.data.contactMethods.emails.splice(z, 1);
				};
			}
		};
	})
	.directive('addresses', function () {
		return {
			scope      : scopeDefinition,
			restrict   : 'E',
			templateUrl: 'common/components/templates/addresses.html',
			controller : function ($scope) {
				$scope.addressTypes = ['HOME', 'WORK', 'OTHER'];

				$scope.addNewAddress = function () {
					$scope.data.setContactMethod('work', new PostalAddress());
				};

				$scope.removeAddress = function (z) {
					$scope.data.contactMethods.addresses.splice(z, 1);
				};
			}
		};
	})
	.directive('functionsProvided', function () {
		return {
			scope      : scopeDefinition,
			restrict   : 'E',
			templateUrl: 'common/components/templates/functions-provided.html',
			controller : function ($scope) {
				$scope.functions = {};
				$scope.functions.function_driver = "DRIVER";
				$scope.functions.function_agent = "AGENT";
				$scope.functions.function_agent_armed = "AGENT_ARMED";
				$scope.functions.function_coordinator = "COORDINATOR";
				$scope.functions.function_greeter = "GREETER";
				$scope.functions.function_guard = "GUARD";
				$scope.functions.function_guard_support = "GUARD_SUPPORT";
				$scope.functions.function_guard_shift_manager = "GUARD_SHIFT_MANAGER";
				$scope.functions.function_guard_night_shift_maintenance = "GUARD_NIGHT_SHIFT_MAINTENANCE";
				$scope.functions.function_guard_goods_receipt = "GUARD_GOODS_RECEIPT";

				$scope.enabled = {};
				$scope.enabled.function_driver = false;
				$scope.enabled.function_agent = false;
				$scope.enabled.function_agent_armed = false;
				$scope.enabled.function_coordinator = false;
				$scope.enabled.function_greeter = false;
				$scope.enabled.function_guard = false;
				$scope.enabled.function_guard_support = false;
				$scope.enabled.function_guard_shift_manager = false;
				$scope.enabled.function_guard_night_shift_maintenance = false;
				$scope.enabled.function_guard_goods_receipt = false;


				$scope.changeFlags = function (flagName, newValue) {
					if (newValue === true) {
						if (_.isNil($scope.data.functionsReceived)) {
							$scope.data.functionsReceived = [];
						}
						// Add flag.
						$scope.data.functionsProvided.push(flagName);
					} else {
						var index = $scope.data.functionsProvided.indexOf(flagName);
						if (index >= 0) {
							$scope.data.functionsProvided.splice(index, 1);
						}
					}
				};

				$scope.init = function () {
					if (_.isArray($scope.data.functionsProvided)) {
						$scope.enabled.function_driver = $scope.data.functionsProvided.indexOf($scope.functions.function_driver) >= 0;
						$scope.enabled.function_agent = $scope.data.functionsProvided.indexOf($scope.functions.function_agent) >= 0;
						$scope.enabled.function_agent_armed = $scope.data.functionsProvided.indexOf($scope.functions.function_agent_armed) >= 0;
						$scope.enabled.function_greeter = $scope.data.functionsProvided.indexOf($scope.functions.function_greeter) >= 0;
						$scope.enabled.function_coordinator = $scope.data.functionsProvided.indexOf($scope.functions.function_coordinator) >= 0;
						$scope.enabled.function_guard = $scope.data.functionsProvided.indexOf($scope.functions.function_guard) >= 0;
						$scope.enabled.function_guard_support = $scope.data.functionsProvided.indexOf($scope.functions.function_guard_support) >= 0;
						$scope.enabled.function_guard_shift_manager = $scope.data.functionsProvided.indexOf($scope.functions.function_guard_shift_manager) >= 0;
						$scope.enabled.function_guard_night_shift_maintenance = $scope.data.functionsProvided.indexOf($scope.functions.function_guard_night_shift_maintenance) >= 0;
						$scope.enabled.function_guard_goods_receipt = $scope.data.functionsProvided.indexOf($scope.functions.function_guard_goods_receipt) >= 0;
					}
				};
				$scope.init();
			}
		};
	})
	.directive('functionsReceived', function () {
		return {
			scope      : scopeDefinition,
			restrict   : 'E',
			templateUrl: 'common/components/templates/functions-received.html',
			controller : function ($scope) {
				$scope.functions = {};
				$scope.functions.function_driver = "DRIVER";
				$scope.functions.function_agent = "AGENT";
				$scope.functions.function_agent_armed = "AGENT_ARMED";
				$scope.functions.function_coordinator = "COORDINATOR";
				$scope.functions.function_greeter = "GREETER";
				$scope.functions.function_guard = "GUARD";
				$scope.functions.function_guard_support = "GUARD_SUPPORT";
				$scope.functions.function_guard_shift_manager = "GUARD_SHIFT_MANAGER";
				$scope.functions.function_guard_night_shift_maintenance = "GUARD_NIGHT_SHIFT_MAINTENANCE";
				$scope.functions.function_guard_goods_receipt = "GUARD_GOODS_RECEIPT";

				$scope.enabled = {};
				$scope.enabled.function_driver = false;
				$scope.enabled.function_agent = false;
				$scope.enabled.function_agent_armed = false;
				$scope.enabled.function_greeter = false;
				$scope.enabled.function_coordinator = false;
				$scope.enabled.function_guard = false;
				$scope.enabled.function_guard_support = false;
				$scope.enabled.function_guard_shift_manager = false;
				$scope.enabled.function_guard_night_shift_maintenance = false;
				$scope.enabled.function_guard_goods_receipt = false;


				$scope.changeFlags = function (flagName, newValue) {
					if (newValue === true) {
						// Add flag.
						if (_.isNil($scope.data.functionsReceived)) {
							$scope.data.functionsReceived = [];
						}
						$scope.data.functionsReceived.push(flagName);
					} else {
						var index = $scope.data.functionsReceived.indexOf(flagName);
						if (index >= 0) {
							$scope.data.functionsReceived.splice(index, 1);
						}
					}
				};

				$scope.init = function () {
					if (_.isArray($scope.data.functionsReceived)) {
						$scope.enabled.function_driver = $scope.data.functionsReceived.indexOf($scope.functions.function_driver) >= 0;
						$scope.enabled.function_agent = $scope.data.functionsReceived.indexOf($scope.functions.function_agent) >= 0;
						$scope.enabled.function_agent_armed = $scope.data.functionsReceived.indexOf($scope.functions.function_agent_armed) >= 0;
						$scope.enabled.function_greeter = $scope.data.functionsReceived.indexOf($scope.functions.function_greeter) >= 0;
						$scope.enabled.function_coordinator = $scope.data.functionsReceived.indexOf($scope.functions.function_coordinator) >= 0;
						$scope.enabled.function_guard = $scope.data.functionsReceived.indexOf($scope.functions.function_guard) >= 0;
						$scope.enabled.function_guard_support = $scope.data.functionsReceived.indexOf($scope.functions.function_guard_support) >= 0;
						$scope.enabled.function_guard_shift_manager = $scope.data.functionsReceived.indexOf($scope.functions.function_guard_shift_manager) >= 0;
						$scope.enabled.function_guard_night_shift_maintenance = $scope.data.functionsReceived.indexOf($scope.functions.function_guard_night_shift_maintenance) >= 0;
						$scope.enabled.function_guard_goods_receipt = $scope.data.functionsReceived.indexOf($scope.functions.function_guard_goods_receipt) >= 0;
					}
				};

				$scope.init();

			}
		};
	})


	.directive('specialService', function () {
		var specialServiceScope = scopeDefinition;
		specialServiceScope.cl = "=";
		specialServiceScope.disabled = "<";

		return {
			scope      : specialServiceScope,
			restrict   : 'E',
			templateUrl: 'common/components/templates/special-service.html',
			controller : ['$scope', 'resourceService', 'partyGroupService', 'resellerService', '$rootScope', '$mdDialog', '$mdToast', '$modal', '$filter', '$q',
				function ($scope, resourceService, partyGroupService, resellerService, $rootScope, $mdDialog, $mdToast, $modal, $filter, $q) {

					var clientGroupCode = '';
					var clientContacts = [];		// Client contacts
					var possibleRequesters = [];	// Client contacts + reseller contacts
					var staff = [];					// Staff members
					var vehicles = [];				// Available vehicles
					// All special ops functions.
					resourceService.findAvailableResources(['DRIVER', 'AGENT', 'AGENT_ARMED', 'COORDINATOR', 'GREETER']).then(function (resources) {
						// console.log('resources', resources);


						staff = _.filter(resources, function (o) {
							return o.type !== 'VEHICLE';
						});

						// Filter vehicles only
						vehicles = _.filter(resources, function (o) {
							return o.type === 'VEHICLE';
						});
						console.log('vehicles', vehicles);
					});

					var calculateName = function () {
						var name = [];

						if (!_.isNil($scope.data.client.object)) {
							var short = $scope.data.client.object.name.split(' ');
							name.push(short[0]);
						}
						if (!_.isNil($scope.data.principals[0].object)) {
							name.push($scope.data.principals[0].object.name.last);
						}
						if (_.isDate($scope.data.start)) {
							name.push(moment($scope.data.start).format('YYYYMMDD'));
						}

						$scope.data.name = name.join('-');
					};

					$scope.startDateChange = function () {
						calculateName();
					};

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

					$scope.clientSelectedItemChange = function (item, assignContactToList) {

						if (!_.isNil(item)) {
							calculateName();

							// Requesting client contacts and reseller contacts if exists
							var contactsRequests = [];
							contactsRequests.push(resellerService.findResellerContactsByClient(item.id));
							contactsRequests.push(partyGroupService.findOneOwnedByPartyAndType(item.id, 'COMPANY_CONTACTS', true));

							$q.all(contactsRequests).then(function (results) {
								var resellerContactsResult = results[0];
								var clientContactsResult = results[1];

								// Set current group code of client organization
								clientGroupCode = (_.isNil(clientContactsResult)) ? null : clientContactsResult.code;
								if (!_.isNil(clientContactsResult)) {

									clientContacts = _.map(clientContactsResult.values, function (o) {
										return o.party;
									});
									possibleRequesters = clientContacts;
									console.log('clientContacts', clientContacts);
								} else {
									clientContacts = [];
									possibleRequesters = [];
									infoDialog('party.dialogs.noContacts', $modal, $filter);
								}

								// Reseller contacts?
								if (!_.isNil(resellerContactsResult)) {
									var resellerParties = _.map(resellerContactsResult.values, function (o) {
										return o.party;
									});
									possibleRequesters = possibleRequesters.concat(resellerParties);
								}

								if (!_.isNil(assignContactToList) && clientContacts.length > 0) {
									var contact = _.find(clientContacts, function (client) {
										return (client.name.first === assignContactToList.contact.name.first &&
											client.name.last === assignContactToList.contact.name.last);
									});

									// Update selection
									switch (assignContactToList.type) {
										// Have been inserted the contact from principal list
										case 'Principal':
											$scope.data.principals.forEach(function (principal, iPrincipal) {
												if (principal.object.addOption === true) {
													$scope.data.principals[iPrincipal].object = contact;
												}
											});
											break;
										// Have been inserted the contact from requester list
										case 'Requester':
											$scope.data.interestedParty.object = contact;
											break;
									}
								}
							});
						}
					};

					// Initialize client contacts
					if ($scope.data.client.object) {
						$scope.clientSelectedItemChange($scope.data.client.object);
					}

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
						var out = query ? possibleRequesters.filter(createFilterForRequester(query)) : possibleRequesters;
						out = out.concat([{
							name     : {last: '  '},	// Ensure position on top
							addOption: true
						}]);
						// console.log('out requesters', out);
						return out;
					};

					var clearRequesterOption = function () {
						$scope.data.interestedParty.object = null;
					};

					$scope.requesterSelectedItemChange = function (item) {
						if (item) {
							if (item.addOption) {
								if (_.isNil(clientGroupCode) || clientGroupCode === '') {
									infoDialog('party.dialogs.noContacts', $modal, $filter);
									clearRequesterOption();
									return;
								}
								createContact('Requester'); //
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
						var out = query ? clientContacts.filter(createFilterForPrincipal(query)) : clientContacts;
						return out.concat([{
							name     : {last: '  '},	// Ensure position on top
							addOption: true
						}]);
					};

					var clearPrincipalOption = function () {
						$scope.data.principals.forEach(function (principal, iPrincipal) {
							if (principal.object.addOption === true) {
								$scope.data.principals[iPrincipal].object = null;
							}
						});
					};

					$scope.principalSelectedItemChange = function (item) {
						if (item) {
							if (item.addOption) {
								if (_.isNil(clientGroupCode) || clientGroupCode === '') {

									infoDialog('party.dialogs.noContacts', $modal, $filter);
									// Clean option
									clearPrincipalOption();
									return;
								}
								createContact('Principal');
							} else {
								calculateName();
							}
						}
					};

					$scope.addPrincipal = function () {
						$scope.data.principals.push({object: null, search: ''});
					};

					$scope.removePrincipal = function (z) {
						if ($scope.data.principals.length === 1) {
							// infoDialog('services.specialForm.dialogs.principalEmpty');
							return;
						}
						$scope.data.principals.splice(z, 1);
					};

					$scope.hideAddPrincipal = function (index) {
						var principalCompleted = !_.every($scope.data.principals, function (principal) {
							return (!_.isNil(principal.object));
						});

						return (principalCompleted || $scope.data.principals.length - 1 > index);
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

					$scope.staffSelectedItemChange = function (item, index) {
						if (item) {
							// Default selected type
							$scope.data.staff[index].object.type = 'DRIVER';
						}
					};

					$scope.addStaff = function () {
						$scope.data.staff.push({object: null, search: ''});
					};

					$scope.removeStaff = function (z) {
						if ($scope.data.staff.length === 1) {
							// infoDialog('services.specialForm.dialogs.staffEmpty');
							return;
						}
						$scope.data.staff.splice(z, 1);
					};

					$scope.hideAddStaff = function (index) {
						var staffCompleted = !_.every($scope.data.staff, function (staff) {
							return (!_.isNil(staff.object));
						});

						return (staffCompleted || $scope.data.staff.length - 1 > index);
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

					$scope.addVehicle = function () {
						$scope.data.vehicles.push({object: null, search: ''});
					};

					$scope.removeVehicle = function (z) {
						if ($scope.data.vehicles.length === 1) {
							// infoDialog('services.specialForm.dialogs.vehicleEmpty');
							return;
						}
						$scope.data.vehicles.splice(z, 1);
					};

					$scope.hideAddVehicle = function (index) {
						var vehiclesCompleted = !_.every($scope.data.vehicles, function (vehicle) {
							return (!_.isNil(vehicle.object));
						});

						return (vehiclesCompleted || $scope.data.vehicles.length - 1 > index);
					};

					// Markdown editor
					$scope.fullScreenPreview = function () {
						$rootScope.markdownEditorObjects.specialOpsDescription.showPreview();
						$rootScope.markdownEditorObjects.specialOpsDescription.setFullscreen(true);
					};

					$scope.onFullScreenCallback = function (e) {
						e.showPreview();
					};

					$scope.onFullScreenExitCallback = function (e) {
						e.hidePreview();
					};

					var refreshClientContactsList = function (type, insertedContact) {
						if ($scope.data.client.object) {
							$scope.clientSelectedItemChange(
								$scope.data.client.object,
								{contact: insertedContact, type: type}
							);
						}
					};

					// Add principal dialog
					var createContact = function (type) {
						$mdDialog.show({
							controller         : ['$scope', function ($scope) {

								// Create a new staff
								var principal = new Person();
								principal.setContactMethod('work', new PhoneNumber());
								principal.setContactMethod('work', new Email());
								principal.setContactMethod('Home', new PostalAddress());

								$scope.contact = principal;
								$scope.type = type;

								$scope.save = function () {
									if (!_.isNil(clientGroupCode) && clientGroupCode !== '') {
										console.log('$scope.contact', $scope.contact);

										// Validate first and last name
										if ($scope.contact.name.first === '' || _.isNil($scope.contact.name.first)) {
											infoDialog('services.specialForm.dialogs.contactNameEmpty', $modal, $filter);
											return;
										} else if ($scope.contact.name.last === '' || _.isNil($scope.contact.name.last)) {
											infoDialog('services.specialForm.dialogs.contactLastNameEmpty', $modal, $filter);
											return;
										}

										console.log('clientGroupCode', clientGroupCode);
										// Insert principal
										partyGroupService.addItemNewParty(clientGroupCode, $scope.contact, {})
											.then(function (result) {
												console.log('Client contact inserted', result);
												$mdToast.show(
													$mdToast.simple()
														.textContent($filter('translate')('operations.dialogs.clientContactCreated'))
														.position('top right')
														.hideDelay(3000)
												);
												refreshClientContactsList(type, result);

												$mdDialog.cancel();
											});
									} else {
										infoDialog('party.dialogs.noContacts', $scope, $filter);
									}
								};

								$scope.cancel = function () {
									switch (type) {
										case 'Principal':
											clearPrincipalOption();
											break;

										case 'Requester':
											clearRequesterOption();
											break;
									}
									$mdDialog.cancel();
								};
							}],
							templateUrl        : 'common/components/templates/contact.html',
							parent             : angular.element(document.body),
							clickOutsideToClose: true
						});
					};
				}]
		};
	});