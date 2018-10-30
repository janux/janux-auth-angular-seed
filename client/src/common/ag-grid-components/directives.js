var _ = require('lodash');

angular.module('agGridDirectives',[])

.directive('agGridLargeText', ['$modal', function($modal) {
	return {
		restrict: 'A',
		scope: false,
		link: function (scope, elem, attrs) {
			elem.bind("touchstart click", function (e) {

				$modal.open({
					templateUrl: 'common/ag-grid-components/templates/large-text-cell-editor.html',
					controller: ['$scope','$modalInstance',
						function($scope , $modalInstance) {
							var model = attrs['ngModel'];
							$scope.data = scope[model];
							$scope.ok = function() {
								scope[model] = $scope.data;
								$modalInstance.close();
							};
						}],
					size: 'sm'
				});

				e.preventDefault();
				e.stopPropagation();
			});
		}
	}
}])

.directive('agGridVehicleAutocomplete', ['$mdDialog', function( $mdDialog ) {
	return {
		restrict: 'A',
		scope:false,
		link: function (scope, elem, attrs) {

			elem.bind("touchstart click", function (e) {

				$mdDialog.show({
					controller: ['$scope',
						function($scope ) {
							var model = attrs['ngModelToDirective'];
							var selectedItem = undefined;
							$scope.data = scope[model];

							// Setting available vehicles for selection.
							$scope.vehicles = scope.driversAndOps.vehicles;

							$scope.valueAutoVehicle = '';

							// Setting vehicle value. And validate if there is a vehicle
							// in the time entry records.
							if (!_.isNil($scope.data)) {
								$scope.valueAutoVehiclePlaceholder = $scope.data.resource.name +  " " + $scope.data.resource.plateNumber;
								$scope.odometerStart= $scope.data.odometerStart;
								$scope.odometerEnd= $scope.data.odometerEnd;
								$scope.fuelStart= $scope.data.fuelStart;
								$scope.fuelEnd= $scope.data.fuelEnd;
							}

							$scope.agGridVehicleSelectedItemChange = function(item) {
								console.log(" vehicles item changes to " + JSON.stringify(item));
								selectedItem = _.cloneDeep(item);
							};

							function createFilterForVehicle(query) {
								return function filterFn(resource) {
									var name = resource.resource.name + resource.resource.plateNumber;
									var contains = name.toLowerCase().includes(query.toLowerCase());
									return contains;
								};
							}

							$scope.agGridVehicleSearch = function(query) {
								var out = query ? $scope.vehicles.filter( createFilterForVehicle(query) ) : $scope.vehicles;
								console.log('agGridVehicleSearch', out);
								return out;
							};

							$scope.ok = function() {
								if(_.isNil(selectedItem)) {
									selectedItem= _.cloneDeep($scope.data);
									selectedItem.odometerStart = $scope.odometerStart;
									selectedItem.odometerEnd = $scope.odometerEnd;
									selectedItem.fuelStart = $scope.fuelStart;
									selectedItem.fuelEnd = $scope.fuelEnd;
									// Send the new vehicles as selected record to the ag-grid.
									scope[model] = selectedItem;
									scope.$broadcast('agGridVehicleUpdateEvent',selectedItem);
								}

								$mdDialog.cancel();
							};
						}],
					templateUrl: 'common/ag-grid-components/templates/autocomplete-vehicle-cell-editor.html',
					parent: angular.element(document.body),
					clickOutsideToClose: true
				})
				.then(function(answer) {

				}, function() {

				});

				e.preventDefault();
				e.stopPropagation();
			});


		}
	}
}])

.directive('agGridStaffAutocomplete', [ function() {
	return {
		restrict: 'E',
		scope:false,
		templateUrl: 'common/ag-grid-components/templates/autocomplete-staff-cell-editor.html',
		controller: ['$scope','$attrs','nameQueryService', function($scope,$attrs,nameQueryService) {
			var resource = undefined;
			$scope.valueAutoStaff = ''; // $scope[$attrs.selectedValueModel];
			$scope.autoStaffSelectedItem = '';
			$scope.agGridOperationDrivers = $scope.driversAndOps.allPersonnelAvailableForSelection;
			if(_.isNil($scope[$attrs.selectedValueModel]) === false){
				resource = $scope[$attrs.selectedValueModel].resource;
				$scope.valueAutoStaffPlaceholder = resource.name.last+' '+resource.name.first;
				// $scope.driversAndOps comes form parent controller
			}else{
				$scope.valueAutoStaffPlaceholder = '';
			}



			//
			// Staff autocomplete
			//
			$scope.agGridStaffSelectedItemChange = function(item) {
				if(typeof item !== 'undefined') {
					// This item should contain the selected staff member
					console.info('Item changed to ' + JSON.stringify(item));

					// Update ag-grid cell value
					$scope[$attrs.selectedValueModel] = item;

					// Update operation according to selected staff
					// $scope.$broadcast('agGridSelectedOpChange', item);

				} else {
					// This means that the entered search text is empty or doesn't match any staff member
				}
			};

			$scope.agGridStaffSearch = function(query) {
				var out = query ? $scope.agGridOperationDrivers.filter( nameQueryService.createFilterForStaff(query) ) : $scope.agGridOperationDrivers;
				console.log('agGridStaffSearch', out);
				return out;
			};
		}]
	}
}])
.directive('agGridOpAutocomplete', [ function() {
	return {
		restrict: 'E',
		scope:false,
		templateUrl: 'common/ag-grid-components/templates/autocomplete-op-cell-editor.html',
		controller: ['$scope','$attrs', function($scope,$attrs) {

			var operation = $scope[$attrs.selectedValueModel];

			// $scope.driversAndOps comes form parent controller
			$scope.agGridOperations = $scope.driversAndOps.operations;
			$scope.agGridDriversAssignedToOperations = $scope.driversAndOps.driversAssignedToOperations;

			$scope.valueAutoOp = ''; // $scope[$attrs.selectedValueModel];
			$scope.valueAutoOpPlaceholder = operation.name;
			$scope.autoOpSelectedItem = '';

			//
			// Operation autocomplete
			//
			$scope.agGridOpsSelectedItemChange = function(item) {
				if(typeof item !== 'undefined') {
					// This item should contain the selected operation
					// console.info('Item changed to ' + JSON.stringify(item));
					$scope[$attrs.selectedValueModel] = item;
					// Update client cell
					$scope.$broadcast('agGridClientUpdate', item.client);
				} else {
					// This means that the entered search text is empty or doesn't match any operation
				}
			};

			$scope.comparator=function (x,y) {
				var a = x.value;
				var b = y.value;

				if(a.type === 'SPECIAL_OPS'){
					if(_.isNil(a.start) && _.isNil(b.start)) {
						return 0;
					}else if(_.isNil(b.start)){
						return 1;
					}else {
						return a.start.getTime()>b.start.getTime() ? -1 : 1;
					}

				}else{
					return a.name.localeCompare(b.name);
				}
			};

			function createFilterForOps(query) {
				return function filterFn(operation) {
					var contains = operation.name.toLowerCase().includes(query.toLowerCase());
					return contains;
				};
			}

			$scope.agGridOpsSearch = function(query) {
				return query ? $scope.agGridOperations.filter( createFilterForOps(query) ) : $scope.agGridOperations;
			};

			$scope.$on('agGridSelectedOpChange', function (event, staffItem) {
				var selectedDriver = _.find($scope.agGridDriversAssignedToOperations,function (o) {
					return o.id === staffItem.id;
				});

				var operationId = selectedDriver.opId;

				var staffOperations = _.filter($scope.agGridOperations, {id:operationId});

				$scope.autoOpSelectedItem = staffOperations[0];
				$scope[$attrs.selectedValueModel] = staffOperations[0].name;
				console.log('Staff assigned operations', staffOperations);

				$scope.$broadcast('agGridClientUpdate', staffOperations[0].client);
			});
		}]
	}
}])
.directive('agGridClientUpdater', [ function() {
	return {
		restrict: 'E',
		scope:false,
		templateUrl: 'common/ag-grid-components/templates/client-cell-updater.html'
	}
}])
.directive('agGridDurationUpdater', [ function() {
	return {
		restrict: 'E',
		scope:false,
		templateUrl: 'common/ag-grid-components/templates/duration-cell-updater.html'
	}
}])
.directive('agGridCommentEditor', [ function() {
	return {
		restrict: 'E',
		scope:false,
		templateUrl: 'common/ag-grid-components/templates/comment-cell-editor.html'
	}
}])
.directive('agGridAbsence', [ function() {
	return {
		restrict: 'E',
		scope:false,
		templateUrl: 'common/ag-grid-components/templates/absence-cell-editor.html'
	}
}])
.directive('agGridDriverAbsence', [ function() {
	return {
		restrict: 'E',
		scope:false,
		templateUrl: 'common/ag-grid-components/templates/driver-absence-cell-editor.html'
	}
}])
.directive('agGridGuardExtras', [ function() {
	return {
		restrict: 'E',
		scope:false,
		templateUrl: 'common/ag-grid-components/templates/guard-extras-cell-editor.html'
	}
}])
.directive('agGridSpecialOpsFunction', [ function() {
	return {
		restrict: 'E',
		scope:false,
		templateUrl: 'common/ag-grid-components/templates/special-ops-function-cell-editor.html'
	}
}])
.directive('agGridViewOperation', [ function() {
	return {
		restrict: 'E',
		scope: true,
		templateUrl: 'common/ag-grid-components/templates/view-operation.html',
		controller: ['$scope','$attrs', function($scope,$attrs) {
			$scope.opId = $attrs.opId;
			$scope.opType = $attrs.opType;
		}]
	}
}])
.directive('agGridStaffEdit', [ function() {
	return {
		restrict: 'E',
		scope: true,
		templateUrl: 'common/ag-grid-components/templates/staff-edit.html',
		controller: ['$scope','$attrs', function($scope,$attrs) {
			$scope.staffId = $attrs.staffId;
		}]
	}
}])
.directive('agGridClientEdit', [ function() {
	return {
		restrict: 'E',
		scope: true,
		templateUrl: 'common/ag-grid-components/templates/client-edit.html',
		controller: ['$scope','$attrs', function($scope,$attrs) {
			$scope.clientId = $attrs.clientId;
		}]
	}
}])
.directive('agGridSupplierEdit', [ function() {
	return {
		restrict: 'E',
		scope: true,
		templateUrl: 'common/ag-grid-components/templates/supplier-edit.html',
		controller: ['$scope','$attrs', function($scope,$attrs) {
			$scope.supplierId = $attrs.supplierId;
		}]
	}
}])
.directive('agGridViewInvoiceDetails', [ function() {
	return {
		restrict   : 'E',
		scope      : true,
		templateUrl: 'common/ag-grid-components/templates/view-invoice-detail.html',
		controller : ['$scope', '$attrs', '$rootScope', 'config', function ($scope, $attrs, $rootScope, config) {
			$scope.showInvoiceDetail = function () {
				// console.log('internal with invoice' + $attrs.invoicenumber);
				$rootScope.$broadcast(config.invoice.events.invoiceDetailSelected, $attrs.invoicenumber);
			};
		}]
	}
}])
.directive('agGridStaffInvite', [ function() {
	return {
		restrict: 'E',
		scope: true,
		templateUrl: 'common/ag-grid-components/templates/staff-invite.html',
		controller: ['$rootScope','$scope','$attrs','$mdDialog','roleService','partyService','dialogService','userService','$mdToast','$filter',
			function( $rootScope , $scope , $attrs , $mdDialog , roleService , partyService , dialogService , userService , $mdToast , $filter) {
			$scope.staffId = $attrs.staffId;
			$scope.staffEmailLength = Number($attrs.staffEmailLength);

			$scope.iconDisabled = $scope.staffEmailLength <= 0;

			///partyService.findOne($scope.staffId).then(function (respStaff) {
			///	var emails = respStaff.contactMethods.emails;
			///	if ((!_.isNil(emails) && emails.length > 0) && (!_.isNil(emails[0].address) && emails[0].address !== '')) {
			///		$scope.iconDisabled = false;
			///	}
			///});

			var staff = {};
			var emails = [];

			$scope.staffInviteDialog = function () {
				roleService.findAll().then(function (roles) {
					partyService.findOne($scope.staffId).then(function (respStaff) {
						staff = respStaff;
						emails = respStaff.contactMethods.emails;
						// console.log('staff contact emails',$scope.staffId, emails);

						$scope.roles = _.chain(roles).sortBy('sortOrder').mapValues(function (role) {
							role.selected = false;
							return role;
						}).value();

						if (!$rootScope.userRole.isAlmighty) {
							dialogService.info('dialogs.accessDenied');
							return;
						}

						if ((!_.isNil(emails) && emails.length > 0) && (!_.isNil(emails[0].address) && emails[0].address !== '')) {
							$scope.selectedEmail = emails[0].address;
							$scope.emails = emails;

							$mdDialog.show({
								clickOutsideToClose: true,
								templateUrl        : 'common/components/templates/staff-invite-dialog.html',
								scope              : $scope,
								preserveScope      : true,
								controller         : ['$scope', '$mdDialog', 'userInvService',
									function ($scope, $mdDialog, userInvService) {

									$scope.inviteStaff = function () {
										// Get array with selected roles
										var selectedRoles = _.reduce($scope.roles, function (result, role) {
											if (role.selected) {
												result.push(role.name);
											}
											return result;
										}, []);

										if (selectedRoles.length > 0) {
											console.log('selected roles', selectedRoles);
											userInvService.inviteToCreateAccount(staff.id,  $scope.selectedEmail, selectedRoles).then(function (responseInv) {
												console.log('staff invitation', responseInv);
												$mdToast.show(
													$mdToast.simple()
														.textContent($filter('translate')('staff.dialogs.invSent'))
														.position( 'top right' )
														.hideDelay(3000)
												);
											});
											$mdDialog.hide();
										} else {
											dialogService.info('staff.dialogs.noRoleSel');
										}
									};

									$scope.closeStaffInviteDialog = function () {
										$mdDialog.hide();
									};
								}]
							});
						} else {
							// dialogService.info('party.person.dialogs.noEmail');
						}
					});

					// console.log('roles', $scope.roles);
				});
			};
		}]
	}
}])
.directive('agGridUsersEdit', [ function() {
	return {
		restrict: 'E',
		scope: true,
		templateUrl: 'common/ag-grid-components/templates/users-edit.html',
		controller: ['$scope','$attrs', function($scope,$attrs) {
			$scope.userId = $attrs.userId;
		}]
	}
}])
.directive('agGridStaffContractor', [ function() {
	return {
		restrict: 'E',
		scope: true,
		templateUrl: 'common/ag-grid-components/templates/staff-contractor.html',
		controller: ['$scope','$attrs', function($scope,$attrs) {
			$scope.isExternal = JSON.parse($attrs.isExternal);
		}]
	}
}])

// This attribute takes the function in the parent scope
// that is responsible for resizing agGrid and executes it
// every time de window changes it's size
.directive('agGridReload', [ function() {
	return {
		restrict: 'A',
		scope: false,
		link: function(scope, element, attrs) {
			var onResize = function(){
				scope[attrs['agGridReload']](window.innerWidth);
			};
			angular.element(window).bind('resize', onResize);

			scope.$on('$destroy', function () {
				angular.element(window).off('resize', onResize);
			});
			//This line is responsable for getting the size of the window on load
			//For AgGrid display
			scope.$emit('agGridWindowSize',window.innerWidth);
		}
	};
}]);
