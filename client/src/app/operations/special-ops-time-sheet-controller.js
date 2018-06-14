'use strict';

var moment = require('moment');
var _ = require('lodash');
var agGridComp = require('common/ag-grid-components');
var timePeriods = require('common/time-periods');

module.exports = ['$rootScope', '$scope', '$mdDialog', 'config', 'jnxStorage', 'operationService', 'resourceService', '$q', '$timeout', '$modal', '$interval', 'driversAndOps', 'timeEntries', 'timeEntryService', '$filter', '$state', '$translate','localStorageService',
	function ($rootScope, $scope, $mdDialog, config, jnxStorage, operationService, resourceService, $q, $timeout, $modal, $interval, driversAndOps, timeEntries, timeEntryService, $filter, $state, $translate, localStorageService) {

		var storedFilterPeriod = jnxStorage.findItem('specialOpsTimeLogFilterPeriod', true);
		var columnsFiltersKey = 'januxSpecialOpsColumnsFilters';
		$scope.driversAndOps = driversAndOps;
		$scope.periodFilterKey = (storedFilterPeriod) ? storedFilterPeriod : 'last7Days';
		$scope.periodFilterOptions = config.periodFilterSpecialOps;
		$scope.lang = $translate.use();

		$scope.periodChange = function () {
			jnxStorage.setItem('specialOpsTimeLogFilterPeriod', $scope.periodFilterKey, true);
			$scope.findTimeEntries($scope.periodFilterKey);
		};

		var dateTimeFormatString = agGridComp.dateTimeCellEditor.formatString;
		var allDrivers = driversAndOps.allPersonnelAvailableForSelection;
		var driversAssignedToOperations = driversAndOps.driversAssignedToOperations;
		var vehiclesAssignedToOperations = driversAndOps.vehiclesAssignedToOperations;
		var allVehicles = driversAndOps.vehicles;
		var operations = driversAndOps.operations;
		var selectedDriver;

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

		// var refreshStartServiceTime = 60 * 1000;	// 1 minute
		// // Refresh start time
		// $interval(function () {
		// 	$scope.lbRow.start = moment().format(dateTimeFormatString);
		// }, refreshStartServiceTime);

		// Models used when entering the search query for the autocomplete fields
		$scope.lbSearch = {
			staff    : '',
			operation: '',
			provider : '',
			vehicle  : ''
		};


		function setExtraFlag(resource) {
			if (resource.resource.isExternal === true) {
				resource.isExternal = true;
			}
			return resource;
		}

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

		// Runs every time the text in the field to find the staff member changes
		// $scope.staffSearchTextChange = function(text) {
		// 	console.info('Text changed to ' + text);
		// };

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

		function createFilterForStaff(query) {
			return function filterFn(operationDriver) {
				var driver = operationDriver.resource;
				var name = (driver.name.last + ' ' + driver.name.first).toLowerCase()
					.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
				var contains = name.toLowerCase().includes(query.toLowerCase());
				return contains;
			};
		}

		$scope.staffSearch = function (query) {
			return query ? allDrivers.filter(createFilterForStaff(query)) : allDrivers;
		};


		function createFilterForVehicle(query) {
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

		function createFilterForOps(query) {
			return function filterFn(operation) {
				var contains = operation.name.toLowerCase().includes(query.toLowerCase());
				return contains;
			};
		}

		$scope.opsSearch = function (query) {
			return query ? operations.filter(createFilterForOps(query)) : operations;
		};


		$scope.export = function () {
			var ids = [];

			$scope.gridOptions.api.forEachNodeAfterFilter(function (item) {
				ids.push(item.data.id);
			});

			timeEntryService.timeEntryReportSpecialOps(ids);
		};

		// Add new record
		$scope.addRow = function () {
			// Selected person

			if (!$scope.lbRow.staff) {
				infoDialog('operations.dialogs.invalidStaff');
				return;
			}

			if (!$scope.lbRow.operation) {
				infoDialog('operations.dialogs.invalidOperation');
				return;
			}

			if (!$scope.lbRow.function) {
				infoDialog('operations.dialogs.invalidFunction');
				return;
			}


			//////
			if (!!$scope.driverTimeSheet.$valid) {
				var begin = moment($scope.lbRow.start);
				var end = '', endToInsert;
				var vehicle;

				if (_.isNil($scope.lbRow.end) === false) {
					end = moment($scope.lbRow.end);
					endToInsert = end.toDate();

					if (begin > end) {
						infoDialog('operations.dialogs.endDateError');
						return;
					}
				}

				if (!_.isNil($scope.lbRow.odometerEnd) && !_.isNil($scope.lbRow.odometerStart) &&
					_.toNumber($scope.lbRow.odometerStart) > _.toNumber($scope.lbRow.odometerEnd)) {
					infoDialog('operations.dialogs.odometerStartGreaterThanEnd');
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
					'idOperation': $scope.lbRow.operation.id
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


				timeEntryService.insert(specialOpsTimeEntryToInsert).then(function () {
					$scope.findTimeEntries($scope.periodFilterKey);

					// Wait before performing the form reset
					$timeout(function () {
						initRowModel();
						$scope.driverTimeSheet.$setUntouched(true);
						$scope.driverTimeSheet.$setPristine(true);
						// Go to last page
						// $scope.gridOptions.api.paginationGoToLastPage();
					}, 10);
				});
			}

		};

		function deleteConfirmed(rowsToDelete) {
			$scope.gridOptions.api.updateRowData({remove: rowsToDelete});

			var timeEntryIds = _.map(rowsToDelete, 'id');
			timeEntryService.removeByIds(timeEntryIds).then(function () {
				// infoDialog('The records were deleted correctly');
			});
		}

		// Remove selected records
		var removeSelected = function () {
			var selectedData = $scope.gridOptions.api.getSelectedRows();
			if (selectedData.length > 0) {
				$modal.open({
					templateUrl: 'app/dialog-tpl/confirm-dialog.html',
					controller : ['$scope', '$modalInstance',
						function ($scope, $modalInstance) {
							$scope.message = $filter('translate')('operations.dialogs.confirmDeletion');

							$scope.ok = function () {
								deleteConfirmed(selectedData);
								$modalInstance.close();
							};

							$scope.cancel = function () {
								$modalInstance.close();
							};
						}],
					size       : 'md'
				});
			} else {
				infoDialog('operations.dialogs.noRowSelectedError');
			}
		};

		//
		// AG-Grid
		//
		var columnDefs = [
			{
				headerName  : $filter('translate')('operations.specialsTimeLog.staff'),
				field       : 'staff',
				editable    : true,
				// cellRenderer: agGridComp.staffCellRenderer,
				valueGetter : function (params) {
					var res = params.data.staff.resource;
					return res.name.last + ' ' + res.name.first;
				},
				cellEditor  : agGridComp.autocompleteStaffCellEditor,
				filter      : 'agTextColumnFilter',
				filterParams: {newRowsAction: 'keep'}
			},
			{
				headerName  : $filter('translate')('operations.specialsTimeLog.operation'),
				field       : 'operation',
				editable    : true,
				// cellRenderer: agGridComp.operationCellRenderer,
				valueGetter : function (params) {
					return params.data.operation.name;
				},
				cellEditor  : agGridComp.autocompleteOpCellEditor,
				width       : 110,
				filter      : 'agTextColumnFilter',
				filterParams: {newRowsAction: 'keep'}
			},
			{
				headerName    : $filter('translate')('operations.specialsTimeLog.function'),
				field         : 'functionValue',
				editable      : true,
				cellEditor    : agGridComp.specialOpsFunctionCellEditor,
				filter        : 'agTextColumnFilter',
				filterParams  : {newRowsAction: 'keep'},
				valueFormatter: function (params) {
					var locale;
					if (!_.isNil(params.data)) {
						switch (params.data.functionValue) {
							case 'DRIVER':
								locale = 'operations.specialsTimeLog.driver';
								break;
							case 'AGENT':
								locale = 'operations.specialsTimeLog.agent';
								break;
							case 'AGENT_ARMED':
								locale = 'operations.specialsTimeLog.agentArmed';
								break;
							case 'GREETER':
								locale = 'operations.specialsTimeLog.greeter';
								break;
							case 'COORDINATOR':
								locale = 'operations.specialsTimeLog.coordinator';
								break;
						}
					}
					if (!_.isNil(locale)) {
						return $filter('translate')(locale);
					} else {
						return '';
					}
				}
			},
			{
				headerName  : $filter('translate')('operations.specialsTimeLog.client'),
				field       : 'client',
				editable    : true,
				cellEditor  : agGridComp.clientCellUpdater,
				filter      : 'agTextColumnFilter',
				filterParams: {newRowsAction: 'keep'}
			},
			{
				headerName    : $filter('translate')('operations.specialsTimeLog.begin'),
				field         : 'begin',
				editable      : true,
				filter        : 'date',
				filterParams  : {
					newRowsAction   : 'keep',
					inRangeInclusive: true,
					comparator      : agGridComp.dateFilterComparator,
					filterOptions   : ['equals', 'notEqual', 'lessThan', 'lessThanOrEqual', 'greaterThan', 'greaterThanOrEqual', 'inRange']
				},
				valueFormatter: function (params) {
					return (params.data.begin) ? moment(params.data.begin).format(dateTimeFormatString) : '';
				},
				cellEditor    : agGridComp.dateTimeCellEditor,
				sort          : 'desc',
				width         : 160
			},
			{
				headerName    : $filter('translate')('operations.specialsTimeLog.end'),
				field         : 'end',
				editable      : true,
				filter        : 'date',
				filterParams  : {
					newRowsAction: 'keep',
					comparator   : agGridComp.dateFilterComparator
				},
				valueFormatter: function (params) {
					return (params.data.end) ? moment(params.data.end).format(dateTimeFormatString) : '';
				},
				cellEditor    : agGridComp.dateTimeCellEditor,
				width         : 160
			},
			{
				headerName: $filter('translate')('operations.specialsTimeLog.duration'),
				field     : 'duration',
				editable  : true,
				cellEditor: agGridComp.durationCellUpdater,
				width     : 95
			},
			{
				headerName    : $filter('translate')('operations.specialsTimeLog.comment'),
				field         : 'comment',
				editable      : true,
				cellEditor    : agGridComp.commentCellEditor,
				cellStyle     : {
					'white-space': 'normal'
				},
				valueFormatter: function (params) {
					var maxLength = 35;
					var comment = params.data.comment;
					return agGridComp.util.truncate(comment, maxLength, '...');
				}
				// cellEditor: 'largeText',
				// cellEditorParams: {
				// 	maxLength: '300',
				// 	cols: '50',
				// 	rows: '6'
				// }
			},
			{
				headerName    : $filter('translate')('operations.specialsTimeLog.vehicle'),
				field         : 'vehicle',
				editable      : true,
				valueFormatter: function (params) {
					var odometerDifference;

					if (!_.isNil(params.data.vehicle)) {
						if (!_.isNil(params.data.vehicle.odometerStart) && !_.isNil(params.data.vehicle.odometerEnd)) {
							odometerDifference = params.data.vehicle.odometerEnd - params.data.vehicle.odometerStart;
							odometerDifference = '(' + odometerDifference + ' km)';
						} else {
							odometerDifference = '';
						}
						return params.data.vehicle.resource.name + ' ' + params.data.vehicle.resource.plateNumber + ' ' + odometerDifference;
					} else {
						return '';
					}
				},
				cellStyle     : {
					'white-space': 'normal'
				},
				cellEditor    : agGridComp.autocompleteVehicleCellEditor,
				width         : 180
			},

			{
				headerName     : '',
				// headerCheckboxSelection: true,
				// headerCheckboxSelectionFilteredOnly: true,
				// checkboxSelection: true,
				cellRenderer   : agGridComp.checkBoxRowSelection,
				cellEditor     : agGridComp.rowActions,
				headerComponent: agGridComp.deleteRowsHeaderComponent,
				editable       : true,
				field          : 'selected',	// field needed to avoid ag-grid warning
				width          : 80
			}
		];

		var agGridSizeToFit = function () {
			$timeout(function () {
				$scope.gridOptions.api.sizeColumnsToFit();
			}, 1000);
		};
		$scope.agGridSizeToFit = agGridSizeToFit;

		$scope.gridOptions = {
			columnDefs               : columnDefs,
			rowData                  : timeEntries,
			enableFilter             : true,
			editType                 : 'fullRow',
			angularCompileRows       : true,
			enableColResize          : true,
			suppressRowClickSelection: true,
			rowSelection             : 'multiple',
			animateRows              : true,
			rowHeight                : 40,
			headerHeight             : 35,
			enableSorting            : true,
			pagination               : true,
			paginationAutoPageSize   : true,
			onGridReady              : function () {
				agGridSizeToFit();

				// This function is defined to be able to trigger the deletion
				// of the rows from the header component that does not have access
				// to the scope.
				$scope.gridOptions.api.deleteRows = removeSelected;

				// Restore filter model.
				var filterModel = localStorageService.get(columnsFiltersKey);
				if (!_.isNil(filterModel)) {
					$scope.gridOptions.api.setFilterModel(filterModel);
					$scope.gridOptions.onFilterChanged();
				}
			},
			onRowEditingStarted      : function () {
				// Nothing to do yet
				// console.log('Row edition started', rowObj);
			},
			onRowValueChanged        : function (rowObj) {
				// console.log('Row data changed', rowObj);

				var endToUpdate;

				if (rowObj.data.end) {
					endToUpdate = moment(rowObj.data.end).toDate();
				}

				var resource = _.clone(rowObj.data.staff);
				// TODO: Temporary solution, remove once we obtain the list of operations and staff separately
				delete resource.opId;

				var specialOpsTimeEntryToUpdate = {
					'id'         : rowObj.data.id,
					'resources'  : [_.clone(resource)],
					'principals' : [],
					'attributes' : [],
					'type'       : 'SPECIAL_OPS',
					'comment'    : rowObj.data.comment,
					'begin'      : moment(rowObj.data.begin).toDate(),
					'end'        : endToUpdate,
					'billable'   : true,
					'idOperation': rowObj.data.operation.id
				};

				specialOpsTimeEntryToUpdate.resources[0].type = rowObj.data.functionValue;

				specialOpsTimeEntryToUpdate.resources[0] = setExtraFlag(specialOpsTimeEntryToUpdate.resources[0]);

				if (!_.isNil(rowObj.data.vehicle)) {

					// Assign vehicle.
					specialOpsTimeEntryToUpdate.resources[1] = _.clone(rowObj.data.vehicle);
					// Validate odometer values.
					if (!_.isNil(specialOpsTimeEntryToUpdate.resources[1].odometerEnd) && !_.isNil(specialOpsTimeEntryToUpdate.resources[1].odometerStart) &&
						_.toNumber(specialOpsTimeEntryToUpdate.resources[1].odometerStart) > _.toNumber(specialOpsTimeEntryToUpdate.resources[1].odometerEnd)) {
						infoDialog('operations.dialogs.odometerStartGreaterThanEnd');
						$scope.findTimeEntries($scope.periodFilterKey);
					} else {
						// $scope.findTimeEntries($scope.periodFilterKey);
						timeEntryService.update(specialOpsTimeEntryToUpdate).then(function () {
							$scope.findTimeEntries($scope.periodFilterKey);
							// infoDialog('Time entry successfully updated');
						});
					}

				} else {
					// $scope.findTimeEntries($scope.periodFilterKey);
					timeEntryService.update(specialOpsTimeEntryToUpdate).then(function () {
						$scope.findTimeEntries($scope.periodFilterKey);
						// infoDialog('Time entry successfully updated');
					});
				}


			},
			localeTextFunc           : function (key, defaultValue) {
				var gridKey = 'grid.' + key;
				var value = $filter('translate')(gridKey);
				return value === gridKey ? defaultValue : value;
			},
			onFilterChanged          : function () {
				// Save filters to local storage.
				var savedFilters;
				savedFilters = $scope.gridOptions.api.getFilterModel();
				localStorageService.set(columnsFiltersKey, savedFilters);
				// console.log('savedFilters' + JSON.stringify(savedFilters));
			}
		};

		$scope.findTimeEntries = function (periodKey) {
			var period = timePeriods.specialOps[periodKey];

			operationService.findWithTimeEntriesByDateBetweenAndTypeByAuthenticatedUser(period.from(), period.to(), 'SPECIAL_OPS')
				.then(function (result) {
					// console.log(JSON.stringify(result));
					var agGridRecords = operationService.mapTimeEntryData(result);

					//Now put the ag-grid ready records to the ui.
					$scope.gridOptions.api.setRowData(agGridRecords);
				});

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

		$scope.$on('sideMenuSizeChange', function () {
			agGridSizeToFit();
		});

		// We need to reload because when the language changes ag-grid doesn't reload by itself
		$rootScope.$on('$translateChangeSuccess', function () {
			console.log('$translateChangeSuccess');
			$state.reload();
		});

		//
		// End of AG-Grid
		//
	}];