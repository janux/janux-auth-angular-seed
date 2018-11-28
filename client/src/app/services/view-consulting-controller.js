'use strict';

var moment = require('moment');
var _ = require('lodash');
var agGridComp = require('common/ag-grid-components');


module.exports =
	['$scope', '$rootScope', 'clientsList', '$state', '$stateParams', 'config', 'operationService', 'invoiceService', 'operation', '$modal', '$filter', 'localStorageService', '$timeout', 'nameQueryService', 'jnxStorage', 'invoices', 'dialogService', function (
		$scope, $rootScope, clientsList, $state, $stateParams, config, operationService, invoiceService, operation, $modal, $filter, localStorageService, $timeout, nameQueryService, jnxStorage, invoices, dialogService) {

		console.debug('Operation', operation);

		var formatStringOnlyHour = agGridComp.dateTimeCellEditor.formatStringOnlyHour;
		var formatStringOnlyDate = agGridComp.dateTimeCellEditor.formatStringOnlyDate;
		var columnsFiltersKey = config.jnxStoreKeys.specialOpsColumnsFilters;
		var storedFilterPeriod = jnxStorage.findItem('specialOpsTimeLogFilterPeriod', true);
		var storedTab = jnxStorage.findItem('specialOpsViewSelectedTab', true);

		$scope.cl = clientsList;
		$scope.editMode = false;
		$scope.currentNavItem = (storedTab) ? storedTab : 'summary';
		$scope.editModeInvoiceDetail = false;
		$scope.periodFilterKey = (storedFilterPeriod) ? storedFilterPeriod : 'last7Days';
		$scope.periodFilterOptions = config.periodFilterSpecialOps;
		$scope.operationId = $stateParams.id;
		$scope.invoices = invoices;
		$scope.invoice = undefined;

		// console.debug('Invoices', invoices);

		$scope.currentNavItem = (storedTab) ? storedTab : 'summary';
		$scope.periodFilterKey = (storedFilterPeriod) ? storedFilterPeriod : 'last7Days';
		$scope.periodFilterOptions = config.periodFilterSpecialOps;
		$scope.operationId = $stateParams.id;


		$scope.changeTab = function (tab) {
			$scope.currentNavItem = tab;
			if (tab !== 'invoiceDetail') {
				jnxStorage.setItem('specialOpsViewSelectedTab', $scope.currentNavItem, true);
			}

		};

		var updateInvoiceList = function () {
			invoiceService.findByIdOperation($stateParams.id)
				.then(function (result) {
					$scope.invoices = result;
					$rootScope.$broadcast(config.invoice.events.invoiceListUpdated, result);
					if ($scope.editModeInvoiceDetail) {
						$rootScope.$broadcast(config.invoice.events.invoiceEditModeEnabled, $scope.invoice);
					}
				});
		};

		var mapOperationToEditable = function (operation) {
			operation.client = {object: operation.client, search: ''};
			operation.interestedParty = {object: operation.interestedParty, search: ''};
			operation.principals = (operation.principals.length > 0) ? _.map(operation.principals, function (principal) {
				return {object: principal, search: ''};
			}) : [{object: null, search: ''}];

			// Filter Vehicles
			operation.vehicles = _.filter(operation.currentResources, {type: 'VEHICLE'});
			operation.vehicles = (operation.vehicles.length > 0) ? _.map(operation.vehicles, function (vehicle) {
				return {object: vehicle, search: ''};
			}) : [{object: null, search: ''}];

			// Filter staff
			operation.staff = _.filter(operation.currentResources, function (resource) {
				return (resource.type !== 'VEHICLE');
			});
			operation.staff = (operation.staff.length > 0) ? _.map(operation.staff, function (staff) {
				return {object: staff, search: ''};
			}) : [{object: null, search: ''}];

			return operation;
		};

		$scope.data = mapOperationToEditable(operation);
		console.debug('editable operation', $scope.data);

		// Update operation
		$scope.save = function () {
			// Process operation to insert
			var operation = _.clone($scope.data);

			// Validate operation
			if (operation.name === '') {
				dialogService.info('services.specialForm.dialogs.nameEmpty');
				return;
			} else if (!_.isDate(operation.start)) {
				dialogService.info('services.specialForm.dialogs.startEmpty');
				return;
			} else if (_.isDate(operation.end)) {
				if (operation.start > operation.end) {
					dialogService.info('operations.dialogs.endDateError');
					return;
				}
			} else if (_.isNil(operation.client.object)) {
				dialogService.info('services.specialForm.dialogs.clientEmpty');
				return;
			}

			operation.client = operation.client.object;
			operation.interestedParty = operation.interestedParty.object;
			operation.principals = _.chain(operation.principals)
				.map('object')
				.filter(function (principal) {
					return (!_.isNil(principal));
				})
				.value();

			var resources = [];

			var staff = _.chain(operation.staff)
				.filter(function (staff) {
					return (!_.isNil(staff.object));
				})
				.map(function (staff) {
					delete staff.object.id;
					return staff.object;
				})
				.value();

			resources = resources.concat(staff);

			var vehicles = _.chain(operation.vehicles)
				.filter(function (vehicle) {
					return (!_.isNil(vehicle.object));
				})
				.map(function (vehicle) {
					delete vehicle.object.id;
					return vehicle.object;
				})
				.value();

			resources = resources.concat(vehicles);

			operation.currentResources = resources;
			operation.start = moment(operation.start).toDate();
			operation.end = (!_.isNil(operation.end)) ? moment(operation.end).toDate() : null;

			delete operation.staff;
			delete operation.vehicles;

			console.debug('Operation to update', operation);

			operationService.update(operation).then(function (result) {
				console.debug('Updated operation', result);
				//$state.go('services.list');
				$scope.editMode = false;
			});
		};

		// Return to operations list
		$scope.cancel = function () {
			$state.go('services.list');
		};

		$scope.enableEditModeInvoiceDetail = function () {
			$scope.editModeInvoiceDetail = true;
			$scope.$broadcast(config.invoice.events.invoiceEditModeEnabled, $scope.invoice);
		};

		$scope.disableEditModeInvoiceDetail = function () {
			$scope.editModeInvoiceDetail = false;
			$scope.$broadcast(config.invoice.events.invoiceEditModeDisabled);
		};

		$scope.cancelInvoiceDetail = function () {
			$scope.editModeInvoiceDetail = false;
			$scope.changeTab('invoices');
			$scope.$broadcast(config.invoice.events.invoiceEditModeDisabled);
		};


		//
		// Time sheet (AG-Grid)
		//
		var columnDefs = [
			{
				headerName  : $filter('translate')('operations.specialsTimeLog.staff'),
				field       : 'staff',
				editable    : false,
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
				editable      : false,
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
							case 'TRANSPORT':
								locale = 'operations.specialsTimeLog.transport';
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
				editable      : false,
				filter        : 'date',
				filterParams  : {
					newRowsAction   : 'keep',
					inRangeInclusive: true,
					comparator      : agGridComp.dateFilterComparator,
					filterOptions   : ['equals', 'notEqual', 'lessThan', 'lessThanOrEqual', 'greaterThan', 'greaterThanOrEqual', 'inRange']
				},
				valueFormatter: function (params) {
					return (params.data.begin) ? moment(params.data.begin).format(formatStringOnlyDate) : '';
				},
				cellEditor    : agGridComp.dateTimeCellEditor,
				sort          : 'desc',
				width         : 160
			},
			{
				headerName    : $filter('translate')('operations.specialsTimeLog.beginHour'),
				field         : 'beginWork',
				editable      : false,
				filter        : 'date',
				filterParams  : {
					newRowsAction: 'keep',
					comparator   : agGridComp.dateFilterComparator
				},
				valueFormatter: function (params) {
					return (params.data.beginWork) ? moment(params.data.beginWork).format(formatStringOnlyHour) : '';
				},
				cellEditor    : agGridComp.dateTimeCellEditor,
				width         : 160
			},
			{
				headerName    : $filter('translate')('operations.specialsTimeLog.endHour'),
				field         : 'endWork',
				editable      : false,
				filter        : 'date',
				filterParams  : {
					newRowsAction: 'keep',
					comparator   : agGridComp.dateFilterComparator
				},
				valueFormatter: function (params) {
					return (params.data.endWork) ? moment(params.data.endWork).format(formatStringOnlyHour) : '';
				},
				cellEditor    : agGridComp.dateTimeCellEditor,
				width         : 160
			},

			{
				headerName : $filter('translate')('operations.specialsTimeLog.duration'),
				field      : 'duration',
				editable   : false,
				width      : 95,
				valueGetter: function (params) {
					return operationService.calculateDuration(params.data.beginWork, params.data.endWork);
				}
			},
			{
				headerName: $filter('translate')('operations.specialsTimeLog.comment'),
				field     : 'comment',
				editable  : false,
				cellEditor: agGridComp.commentCellEditor,
				cellStyle : {
					'white-space': 'normal',
					'padding-top': '0'
				}
			},
			{
				headerName : $filter('translate')('operations.specialsTimeLog.invoiceNumber'),
				editable   : false,
				hide       : !$rootScope.userRole.can('READ', 'FINANCE'),
				valueGetter: function (params) {
					var result = '';
					if (!_.isNil(params.data.invoiceInfo) && !_.isNil(params.data.invoiceInfo.invoice)) {
						result = params.data.invoiceInfo.invoice.invoiceNumber;
					}
					return result;
				}
			},
			{
				headerName             : '',
				headerCheckboxSelection: true,
				// headerCheckboxSelectionFilteredOnly: true,
				// checkboxSelection: true,
				cellRenderer           : agGridComp.checkBoxRowSelection,
				// cellEditor             : agGridComp.rowActions,
				// headerComponent: agGridComp.deleteRowsHeaderComponent,
				editable               : true,
				field                  : 'selected',	// field needed to avoid ag-grid warning
				width                  : 45
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
			editType                 : 'fullRow',
			rowData                  : [],
			enableFilter             : true,
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

				// Restore filter model.
				var filterModel = jnxStorage.findItem(columnsFiltersKey, true);
				if (!_.isNil(filterModel)) {
					$scope.gridOptions.api.setFilterModel(filterModel);
					$scope.gridOptions.onFilterChanged();
				}
			},

			getRowHeight: function (rowObj) {
				// assuming 50 characters per line, working how how many lines we need
				return 18 * (Math.floor(rowObj.data.comment.length / 15) + 1);
			},

			onRowEditingStarted: function (rowObj) {
				// Nothing to do yet
				console.debug('Row edition started', rowObj);
				$rootScope.$emit(config.timeEntry.specialOps.events.setUpdateMode, rowObj.data);
				// rowObj.node.setRowHeight('45');
				// $scope.gridOptions.api.onRowHeightChanged();
			},

			onRowValueChanged: function () {
			},
			localeTextFunc   : function (key, defaultValue) {
				var gridKey = 'grid.' + key;
				var value = $filter('translate')(gridKey);
				return value === gridKey ? defaultValue : value;
			},
			onFilterChanged  : function () {
				// Save filters to local storage.
				var savedFilters;
				savedFilters = $scope.gridOptions.api.getFilterModel();
				jnxStorage.setItem(columnsFiltersKey, savedFilters, true);
				// console.debug('savedFilters' + JSON.stringify(savedFilters));
			},
			onRowSelected    : function () {
				console.debug('Event onRowSelected');
				// Only one refresh at a time
				if (!refreshing) {
					refreshing = true;
					$timeout(function () {
						$scope.gridOptions.api.sizeColumnsToFit();
						refreshing = false;
					}, 200);
				}
			}
		};


		$scope.$on('sideMenuSizeChange', function () {
			agGridSizeToFit();
		});

		// We need to reload because when the language changes ag-grid doesn't reload by itself
		$rootScope.$on('$translateChangeSuccess', function () {
			console.debug('$translateChangeSuccess');
			$state.reload();
		});

		/**
		 * This event is called when ..
		 * An invoice is selected for showing details.
		 * The selected invoice has been updated.
		 * @param invoiceNumber
		 */
		var updatedSelectedInvoice = function (invoiceNumber) {
			invoiceService.findOne(invoiceNumber)
				.then(function (result) {
					$scope.invoice = result;
					$rootScope.$broadcast(config.invoice.events.invoiceDetailUpdated, result);
				});
		};

		$scope.updateInvoiceHeader = function () {
			// console.debug(' inv update ' + JSON.stringify($scope.invoice));
			// Validate if percentage is greater then zero.
			if (_.isNumber($scope.invoice.discountPersonPercentage) === false || $scope.invoice.discountPersonPercentage < 0 || $scope.invoice.discountPersonPercentage > 100) {
				dialogService.info('services.invoice.dialogs.invalidPercentage');
			} else {
				invoiceService.update($scope.invoice)
					.then(function () {
						updatedSelectedInvoice($scope.invoice.invoiceNumber);
						$scope.disableEditModeInvoiceDetail();
					});
			}
		};

		$scope.openAddToInvoiceMenu = function ($mdMenu, ev) {
			$mdMenu.open(ev);
		};

		$scope.generateReport = function () {
			invoiceService.specialOpsInvoiceReport($scope.invoice.invoiceNumber, operation);
		};

		$rootScope.$on(config.invoice.events.invoiceDetailSelected, function (event, invoiceNumber) {
			console.debug('invoice selected:' + invoiceNumber);
			// Switch tab.
			$scope.changeTab('invoiceDetail');
			updatedSelectedInvoice(invoiceNumber);
			updateInvoiceList();
		});

	}];
