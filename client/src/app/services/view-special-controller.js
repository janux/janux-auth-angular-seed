'use strict';

var moment = require('moment');
var _ = require('lodash');
var agGridComp = require('common/ag-grid-components');
var timePeriods = require('common/time-periods');

module.exports =
['$scope','$rootScope','clientsList','$state','$stateParams','config','operationService', 'invoiceService','operation','$modal','$filter','timeEntryService','localStorageService','$timeout','nameQueryService','jnxStorage','driversAndOps', 'invoices', function(
  $scope , $rootScope , clientsList , $state , $stateParams , config, operationService , invoiceService, operation , $modal , $filter , timeEntryService , localStorageService , $timeout , nameQueryService , jnxStorage , driversAndOps, invoices){

	console.log('Operation', operation);

	var dateTimeFormatString = agGridComp.dateTimeCellEditor.formatString;
	var columnsFiltersKey = 'januxSpecialOpsColumnsFilters';
	var findTimeEntries;
	var storedFilterPeriod = jnxStorage.findItem('specialOpsTimeLogFilterPeriod', true);

	$scope.cl = clientsList;
	$scope.editMode = false;
	$scope.currentNavItem = 'summary';
	$scope.driversAndOps = driversAndOps;
	$scope.periodFilterKey = (storedFilterPeriod) ? storedFilterPeriod : 'last7Days';
	$scope.periodFilterOptions = config.periodFilterSpecialOps;
	$scope.invoices = invoices;
	$scope.invoice = undefined;

	function setExtraFlag(resource) {
		if (resource.resource.isExternal === true) {
			resource.isExternal = true;
		}
		return resource;
	}

	$scope.periodChange = function () {
		jnxStorage.setItem('specialOpsTimeLogFilterPeriod', $scope.periodFilterKey, true);
		findTimeEntries($scope.periodFilterKey);
	};

	$scope.changeTab = function (tab) {
		$scope.currentNavItem = tab;

		if (tab === 'time-sheet') {
			var storedFilterPeriod = jnxStorage.findItem('specialOpsTimeLogFilterPeriod', true);
			var periodKey = (storedFilterPeriod)?storedFilterPeriod:'last7Days';

			findTimeEntries(periodKey);
		}
	};

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

	var mapOperationToEditable = function (operation) {
		operation.client = {object:operation.client, search: ''};
		operation.interestedParty = {object:operation.interestedParty, search:''};
		operation.principals = (operation.principals.length>0)?_.map(operation.principals, function(principal){
			return {object:principal, search:''};
		}):[{object:null, search:''}];

		// Filter Vehicles
		operation.vehicles = _.filter( operation.currentResources, { type:'VEHICLE' } );
		operation.vehicles = (operation.vehicles.length>0)?_.map(operation.vehicles,function (vehicle) {
			return {object:vehicle, search:''};
		}):[{object:null, search:''}];

		// Filter staff
		operation.staff = _.filter( operation.currentResources, function (resource){
			return (resource.type !== 'VEHICLE');
		} );
		operation.staff = (operation.staff.length>0)?_.map(operation.staff,function (staff) {
			return {object:staff, search:''};
		}):[{object:null, search:''}];

		return operation;
	};

	$scope.data = mapOperationToEditable(operation);
	console.log('editable operation', $scope.data);

	// Update operation
	$scope.save = function () {
		// Process operation to insert
		var operation = _.clone($scope.data);

		// Validate operation
		if(operation.name === '') {
			infoDialog('services.specialForm.dialogs.nameEmpty');
			return;
		} else if (!_.isDate(operation.start)) {
			infoDialog('services.specialForm.dialogs.startEmpty');
			return;
		} else if (!_.isDate(operation.end)) {
			infoDialog('services.specialForm.dialogs.endEmpty');
			return;
		}
		else if (operation.start > operation.end) {
			infoDialog('operations.dialogs.endDateError');
			return;
		}
		else if (_.isNil(operation.client.object)) {
			infoDialog('services.specialForm.dialogs.clientEmpty');
			return;
		}
		// else if (operation.interestedParty.object === '') {
		// 	infoDialog('services.specialForm.dialogs.requesterEmpty');
		// 	return;
		// } else if (operation.principals.length===0 || operation.principals[0].object === '') {
		// 	infoDialog('services.specialForm.dialogs.principalEmpty');
		// 	return;
		// } else if (operation.staff.length===0 || operation.staff[0].object === '') {
		// 	infoDialog('services.specialForm.dialogs.staffEmpty');
		// 	return;
		// } else if (operation.vehicles.length===0 || operation.vehicles[0].object === '') {
		// 	infoDialog('services.specialForm.dialogs.vehicleEmpty');
		// 	return;
		// }

		operation.client = operation.client.object;
		operation.interestedParty = operation.interestedParty.object;
		operation.principals = _.chain(operation.principal)
			.map('object')
			.filter(function (principal) { return (!_.isNil(principal)); })
			.value();

		var resources = [];

		var staff = _.chain(operation.staff)
			.filter(function (staff) { return (!_.isNil(staff.object)); })
			.map(function (staff) {
				delete staff.object.id;
				return staff.object;
			})
			.value();

		resources = resources.concat(staff);

		var vehicles = _.chain(operation.vehicles)
			.filter(function (vehicle) { return (!_.isNil(vehicle.object)); })
			.map(function (vehicle) {
				delete vehicle.object.id;
				return vehicle.object;
			})
			.value();

		resources = resources.concat(vehicles);

		operation.currentResources = resources;
		operation.start = moment(operation.start).toDate();
		operation.end = (!_.isNil(operation.end))?moment(operation.end).toDate():null;

		delete operation.staff;
		delete operation.vehicles;

		console.log('Operation to update', operation);

		console.log('Operation to save', operation);

		operationService.update(operation).then(function (result) {
			console.log('Updated operation', result);
			$state.go('services.list');
		});
	};

	// Return to operations list
	$scope.cancel = function () {
		$state.go('services.list');
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
	$scope.removeSelected = removeSelected;

	//
	// Time sheet (AG-Grid)
	//
	var columnDefs = [
		{
			headerName  : $filter('translate')('operations.specialsTimeLog.staff'),
			field       : 'staff',
			editable    : true,
			// cellRenderer: agGridComp.staffCellRenderer,
			valueGetter : function (params) {
				var res = params.data.staff.resource;
				return nameQueryService.createLongNameLocalized(res);
			},
			cellEditor  : agGridComp.autocompleteStaffCellEditor,
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
			width         : 80,
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
			headerName     : '',
			headerCheckboxSelection: true,
			// headerCheckboxSelectionFilteredOnly: true,
			// checkboxSelection: true,
			cellRenderer   : agGridComp.checkBoxRowSelection,
			cellEditor     : agGridComp.rowActions,
			// headerComponent: agGridComp.deleteRowsHeaderComponent,
			editable       : true,
			field          : 'selected',	// field needed to avoid ag-grid warning
			width          : 45
		}
	];

	var refreshing = false;		// Flag to indicate if ag-grid is in refresh process
	var agGridSizeToFit = function () {
		$timeout(function () {
			$scope.gridOptions.api.sizeColumnsToFit();
		}, 2000);
	};
	$scope.agGridSizeToFit = agGridSizeToFit;

	// Only init grid if necessary
	$scope.gridOptions = {
		columnDefs               : columnDefs,
		rowData                  : [],
		enableFilter             : true,
		editType                 : 'fullRow',
		angularCompileRows       : true,
		enableColResize          : true,
		suppressRowClickSelection: true,
		rowSelection             : 'multiple',
		animateRows              : true,
		rowHeight                : 45,
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
		onRowEditingStarted      : function (rowObj) {
			// Nothing to do yet
			console.log('Row edition started', rowObj);
			// rowObj.node.setRowHeight('45');
			// $scope.gridOptions.api.onRowHeightChanged();
		},
		onRowValueChanged        : function (rowObj) {
			// console.log('Row data changed', rowObj);
			// rowObj.node.setRowHeight('25');
			// $scope.gridOptions.api.onRowHeightChanged();

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
					findTimeEntries($scope.periodFilterKey);
				} else {
					// $scope.findTimeEntries($scope.periodFilterKey);
					timeEntryService.update(specialOpsTimeEntryToUpdate).then(function () {
						findTimeEntries($scope.periodFilterKey);
						// infoDialog('Time entry successfully updated');
					});
				}

			} else {
				// $scope.findTimeEntries($scope.periodFilterKey);
				timeEntryService.update(specialOpsTimeEntryToUpdate).then(function () {
					findTimeEntries($scope.periodFilterKey);
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
		},
		onRowSelected: function () {
			// Only one refresh at a time
			if (!refreshing) {
				refreshing = true;
				$timeout(function () {
					$scope.gridOptions.api.sizeColumnsToFit();
					refreshing = false;
				},200);
			}
		}
	};

	// Load time entries
	findTimeEntries = function (periodKey) {
		// Load data
		var period = timePeriods.specialOps[periodKey];
		operationService.findWithTimeEntriesByIdsAndDate([$stateParams.id], period.from(), period.to()).then(function (timeEntries) {
			$scope.gridOptions.api.setRowData(operationService.mapTimeEntryData(timeEntries));
			agGridSizeToFit();
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

	$scope.updateInvoiceList = function () {
		invoiceService.findByIdOperation($stateParams.id)
			.then(function (result) {
				$scope.invoices = result;
				$rootScope.$broadcast(config.invoice.events.invoiceListUpdated);
			});
	};

	$scope.updatedSelectedInvoice = function (invoiceNumber) {
		invoiceService.findOne(invoiceNumber)
			.then(function (result) {
				$scope.invoice = result;
				$rootScope.$broadcast(config.invoice.events.invoiceDetailUpdated);
			});
	};
}];