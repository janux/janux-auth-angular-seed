"use strict";

var Person = require('janux-people').Person;
var PhoneNumber = require('janux-people').PhoneNumber;
var Email = require('janux-people').EmailAddress;
var PostalAddress = require('janux-people').PostalAddress;
var agGridComp = require('common/ag-grid-components');

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
		userComponentScope.register = "<";

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
		var customComponentScope = scopeDefinition;
		customComponentScope.register = "<";

		return {
			scope      : customComponentScope,
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
		var customComponentScope = scopeDefinition;
		customComponentScope.register = "<";

		return {
			scope      : customComponentScope,
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
		var customComponentScope = scopeDefinition;
		customComponentScope.register = "<";

		return {
			scope      : customComponentScope,
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
		specialServiceScope.invoices = "=";
		specialServiceScope.showinvoicemanual = "@";
		specialServiceScope.disabled = "<";
		specialServiceScope.disableautomaticname = "@";

		return {
			scope      : specialServiceScope,
			restrict   : 'E',
			templateUrl: 'common/components/templates/special-service.html',
			controller : ['$scope', 'resourceService', 'partyGroupService', 'resellerService', '$rootScope', '$mdDialog', '$mdToast', '$modal', '$filter', '$q', 'nameQueryService', 'invoiceService', 'config', 'operationService',
				function ($scope, resourceService, partyGroupService, resellerService, $rootScope, $mdDialog, $mdToast, $modal, $filter, $q, nameQueryService, invoiceService, config, operationService) {

					// console.log("invoices in directive " + $scope.invoices);

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
						if ($scope.disableautomaticname !== 'true') {
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
						}
					};

					$scope.startDateChange = function () {
						calculateName();
					};


					$scope.clientSearch = function (query) {
						return query ? $scope.cl.filter(nameQueryService.createFilterForClient(query)) : $scope.cl;
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

					$scope.requesterSearch = function (query) {
						var out = query ? possibleRequesters.filter(nameQueryService.createFilterForPerson(query)) : possibleRequesters;
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

					$scope.principalSearch = function (query) {
						var out = query ? clientContacts.filter(nameQueryService.createFilterForPerson(query)) : clientContacts;
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


					$scope.staffSearch = function (query) {
						return query ? staff.filter(nameQueryService.createFilterForStaff(query)) : staff;
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

					//******************
					// Invoice section.
					//******************

					// A little hack. For some reason the html file
					// does not have access to usesRole via $rootScope.
					$scope.userRole = $rootScope.userRole;

					// Giver the value showinvoicemanual comes from a directive.
					// We need to compare the value a  string.
					if ($scope.showinvoicemanual === 'true') {
						$scope.operationStatus = operationService.generateStatus($scope.data, $scope.invoices);
					}

					$scope.invoiceManualForm = {
						invoiceNumber: '',
						invoiceDate  : undefined,
						grandTotal   : 0
					};

					$scope.createNewInvoiceManual = function () {
						var invoiceItemName = "Total";
						if (validateFormInvoiceData()) {
							var operationReference = _.cloneDeep($scope.data);
							// Given this operation object is an object associated to an ui
							// some attributes are dirty or altered. In this case we  fix it or get rid of them.
							// For the purpose to insert an invoice we can alter this object.
							operationReference.client = operationReference.client.object;
							operationReference.principals = [];
							operationReference.currentResources = [];
							operationReference.schedule = [];
							operationReference.interestedParty = null;
							var newInvoice = {
								client             : operationReference.client,
								invoiceNumber      : $scope.invoiceManualForm .invoiceNumber,
								invoiceDate        : $scope.invoiceManualForm .invoiceDate,
								comments           : '',
								items              : [],
								status             : config.invoice.status.inRevision,
								isPaid             : false,
								discount           : 0,
								discountPercentage : 0,
								totalBeforeExpenses: $scope.invoiceManualForm .grandTotal,
								totalAfterExpenses : $scope.invoiceManualForm .grandTotal,
								totalExpenses      : 0,
								grandTotal         : $scope.invoiceManualForm .grandTotal,
								userDefinedValues  : true,
								defaultOperation   : operationReference
							};
							var newItem = {
								itemNumber : 1,
								name       : invoiceItemName,
								total      : 0,
								timeEntries: [],
								expenses   : []
							};
							invoiceService.insertPaid(newInvoice, newItem)
								.then(function () {
									invoiceService.findByIdOperation(operationReference.id)
										.then(function (result) {
											$scope.operationStatus = operationService.generateStatus($scope.data, result);
											$rootScope.$broadcast(config.invoice.events.invoiceListUpdated, result);
										});
								});
						}
					};

					var validateFormInvoiceData = function () {
						var result = true;
						if (!_.isString($scope.invoiceManualForm.invoiceNumber) || $scope.invoiceManualForm.invoiceNumber.trim()==='' ) {
							infoDialog('services.invoice.dialogs.missingInvoiceNumber', $scope, $filter);
						}
						if (!_.isDate($scope.invoiceManualForm.invoiceDate)) {
							infoDialog('services.invoice.dialogs.missingInvoiceDate', $scope, $filter);
						}
						if (!_.isNumber($scope.invoiceManualForm.grandTotal) && $scope.invoiceManualForm.grandTotal <= 0) {
							infoDialog('services.invoice.dialogs.missingInvoiceDate', $scope, $filter);
						}
						return result;
					};

					//******************
					// End invoice section.
					//******************

					var refreshClientContactsList = function (type, insertedContact) {
						if ($scope.data.client.object) {
							$scope.clientSelectedItemChange(
								$scope.data.client.object,
								{contact: insertedContact, type: type}
							);
						}
					};


				}]
		};
	})
	.directive('addSpecialService', function () {
		return {
			scope      : false,
			restrict   : 'E',
			templateUrl: 'common/components/templates/add-special-service.html',
			controller : ['$scope','operationService','timeEntryService','$mdDialog','$timeout','$modal','$filter','nameQueryService',
				function ($scope , operationService , timeEntryService , $mdDialog , $timeout, $modal, $filter , nameQueryService) {
					operationService.findDriversAndSpecialOps().then(function (driversAndOps) {

						var dateTimeFormatString = agGridComp.dateTimeCellEditor.formatString;
						var allDrivers = driversAndOps.allPersonnelAvailableForSelection;
						var driversAssignedToOperations = driversAndOps.driversAssignedToOperations;
						var vehiclesAssignedToOperations = driversAndOps.vehiclesAssignedToOperations;
						var allVehicles = driversAndOps.vehicles;
						var operations = driversAndOps.operations;
						var selectedDriver;

						function setExtraFlag(resource) {
							if (resource.resource.isExternal === true) {
								resource.isExternal = true;
							}
							return resource;
						}

						var initRowModel = function () {
							$scope.lbRow = {
								staff    : '',
								operation: '',
								start    : moment().startOf('day').format(dateTimeFormatString),
								end      : undefined,
								provider : '',
								location : '',
								function : ''
							};
						};
						initRowModel();

						// Models used when entering the search query for the autocomplete fields
						$scope.lbSearch = {
							staff    : '',
							operation: '',
							provider : '',
							vehicle  : ''
						};

						//
						// Staff autocomplete
						//
						$scope.staffSelectedItemChange = function (item) {
							var filteredDrivers;
							var operationId;
							var staffOperations;
							var candidateVehicle;
							var selectedOperation;
							if (typeof item !== 'undefined') {
								// This item should contain the selected staff member
								console.info('Item changed to ' + JSON.stringify(item));

								filteredDrivers = _.filter(driversAssignedToOperations, function (o) {
									return o.resource.id === item.resource.id;
								});

								if (filteredDrivers.length === 0) {
									$scope.lbRow.operation = undefined;
								} else {

									var candidateOperations = _.filter(operations, function (o) {
										return _.find(filteredDrivers, function (it) {
											return it.opId === o.id;
										});
									});

									if (candidateOperations.length === 0) {
										$scope.lbRow.operation = undefined;
										return;
									}

									candidateOperations = _.orderBy(candidateOperations, ['start'], ['desc']);
									selectedOperation = candidateOperations[0];

									// Looking for operation.
									selectedDriver = _.find(driversAssignedToOperations, function (o) {
										return o.opId === selectedOperation.id;
									});

									// Setting the associated person.
									operationId = selectedOperation.id;
									staffOperations = _.filter(operations, {id: operationId});

									console.log('Selected staff operations', staffOperations);
									$scope.lbRow.operation = staffOperations[0];
									$scope.lbRow.function = selectedDriver.type;

									// Setting the associated vehicle.
									candidateVehicle = _.find(vehiclesAssignedToOperations, function (o) {
										return o.opId === operationId;
									});

									if (!_.isNil(candidateVehicle)) {
										var vehicleSelectedItem = _.find(allVehicles, function (o) {
											return candidateVehicle.resource.id === o.resource.id;
										});
										if (!_.isNil(vehicleSelectedItem)) {
											$scope.lbRow.vehicle = vehicleSelectedItem;
										}
									}
								}
							} else {
								// This means that the entered search text is empty or doesn't match any staff member
							}
						};

						$scope.staffSearch = function (query) {
							return query ? allDrivers.filter(nameQueryService.createFilterForStaff(query)) : allDrivers;
						};

						function createFilterForVehicle (query) {
							return function filterFn(elementVehicle) {
								var displayName = elementVehicle.resource.name + elementVehicle.resource.plateNumber;
								return displayName.toLowerCase().includes(query.toLowerCase());
							};
						}

						$scope.vehicleSearch = function (query) {
							return query ? allVehicles.filter(createFilterForVehicle(query)) : allVehicles;
						};

						//
						// Operation autocomplete
						//
						$scope.opsSelectedItemChange = function (item) {
							if (typeof item !== 'undefined') {
								// This item should contain the selected operation
								// console.info('Item changed to ' + JSON.stringify(item));
							} else {
								// This means that the entered search text is empty or doesn't match any operation
							}
						};

						function createFilterForOps (query) {
							return function filterFn(operation) {
								console.log('operation', operation);
								var contains = operation.name.toLowerCase().includes(query.toLowerCase());
								return contains;
							};
						}

						$scope.opsSearch = function (query) {
							return query ? operations.filter(createFilterForOps(query)) : operations;
						};

						$scope.showVehicleDataPopup = function () {

							// Show popup.
							$mdDialog.show({
								clickOutsideToClose: true,
								templateUrl        : 'common/components/templates/vehicle-info-popup.html',
								scope              : $scope,
								preserveScope      : true,
								controller         : function ($scope, $mdDialog) {

									$scope.closeVehiclePopup = function () {
										$mdDialog.hide();
									};
								}
							});
						};

						// Add new record
						$scope.addRow = function () {
							// Selected person

							if (!$scope.lbRow.staff) {
								infoDialog('operations.dialogs.invalidStaff', $modal, $filter);
								return;
							}

							if (!$scope.lbRow.operation && !$scope.operationId) {
								infoDialog('operations.dialogs.invalidOperation', $modal, $filter);
								return;
							}

							if (!$scope.lbRow.function) {
								infoDialog('operations.dialogs.invalidFunction', $modal, $filter);
								return;
							}

							//////
							if (!!$scope.specialServiceAddForm.$valid) {
								var begin = moment($scope.lbRow.start);
								var end = '', endToInsert;
								var vehicle;

								if (_.isNil($scope.lbRow.end) === false) {
									end = moment($scope.lbRow.end);
									endToInsert = end.toDate();

									if (begin > end) {
										infoDialog('operations.dialogs.endDateError', $modal, $filter);
										return;
									}
								}

								if (!_.isNil($scope.lbRow.odometerEnd) && !_.isNil($scope.lbRow.odometerStart) &&
									_.toNumber($scope.lbRow.odometerStart) > _.toNumber($scope.lbRow.odometerEnd)) {
									infoDialog('operations.dialogs.odometerStartGreaterThanEnd', $modal, $filter);
									return;
								}

								var specialOpsTimeEntryToInsert = {
									'resources'  : [_.clone($scope.lbRow.staff)],
									'principals' : [],
									'attributes' : [],
									'type'       : 'SPECIAL_OPS',
									'comment'    : $scope.lbRow.location,
									'begin'      : begin.toDate(),
									'end'        : endToInsert,
									'billable'   : true,
									'idOperation': $scope.operationId || $scope.lbRow.operation.id
								};


								specialOpsTimeEntryToInsert.resources[0].type = $scope.lbRow.function;
								specialOpsTimeEntryToInsert.resources[0] = setExtraFlag(specialOpsTimeEntryToInsert.resources[0]);

								// Adding the vehicle resource.
								if (!_.isNil($scope.lbRow.vehicle)) {
									vehicle = _.clone($scope.lbRow.vehicle);
									// Adding the vehicle fuel and odometer values.
									vehicle.odometerStart = $scope.lbRow.odometerStart;
									vehicle.odometerEnd = $scope.lbRow.odometerEnd;
									vehicle.fuelStart = $scope.lbRow.fuelStart;
									vehicle.fuelEnd = $scope.lbRow.fuelEnd;

									specialOpsTimeEntryToInsert.resources[1] = vehicle;
								}
								console.log('specialOpsTimeEntryToInsert', specialOpsTimeEntryToInsert);

								timeEntryService.insert(specialOpsTimeEntryToInsert).then(function () {
									$scope.findTimeEntries($scope.periodFilterKey);

									// Wait before performing the form reset
									$timeout(function () {
										initRowModel();
										$scope.specialServiceAddForm.$setUntouched(true);
										$scope.specialServiceAddForm.$setPristine(true);
										// Go to last page
										// $scope.gridOptions.api.paginationGoToLastPage();
									}, 10);
								});
							}
						};

						$scope.export = function () {
							var ids = [];

							$scope.gridOptions.api.forEachNodeAfterFilter(function (item) {
								ids.push(item.data.id);
							});

							timeEntryService.timeEntryReportSpecialOps(ids);
						};
					});
				}]
		};
	})
	.directive('invoice', function () {
		var scopeDefinition = {'invoices': '='};
		return {
			scope      : scopeDefinition,
			restrict   : 'E',
			controller : require('./controllers/invoice-controller'),
			templateUrl: 'common/components/templates/invoice.html'
		}
	})

	.directive('invoiceDetail', function () {
		var scopeDefinition = {'invoice': '='};
		return {
			scope      : scopeDefinition,
			restrict   : 'E',
			controller : require('./controllers/invoice-detail-controller'),
			templateUrl: 'common/components/templates/invoice-detail.html'
		}
	})

	.directive('invoiceDetailPerson', function () {
		var scopeDefinition = {'invoice': '='};
		return {
			scope      : scopeDefinition,
			restrict   : 'E',
			controller : require('./controllers/invoice-detail-person-controller'),
			templateUrl: 'common/components/templates/invoice-detail-person.html'
		}
	})

	.directive('invoiceDetailVehicle', function () {
		var scopeDefinition = {'invoice': '='};
		return {
			scope      : scopeDefinition,
			restrict   : 'E',
			controller : require('./controllers/invoice-detail-vehicle-controller'),
			templateUrl: 'common/components/templates/invoice-detail-vehicle.html'
		}
	})

	.directive('invoiceDetailExpense', function () {
		var scopeDefinition = {'invoice': '='};
		return {
			scope      : scopeDefinition,
			restrict   : 'E',
			controller : require('./controllers/invoice-detail-expense-controller'),
			templateUrl: 'common/components/templates/invoice-detail-expense.html'
		}
	});
