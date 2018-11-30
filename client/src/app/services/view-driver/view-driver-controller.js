'use strict';

var moment = require('moment');
var _ = require('lodash');
var agGridComp = require('common/ag-grid-components');
var timePeriods = require('common/time-periods');

module.exports =
	['$scope', '$rootScope', 'clientsList', '$state', '$stateParams', 'config', 'operationService', 'invoiceService', 'operation', '$modal', '$filter', 'timeEntryService', 'localStorageService', '$timeout', 'nameQueryService', 'jnxStorage', 'driversAndOps', 'invoices', '$mdDialog', '$mdToast', 'dialogService', function (
		$scope, $rootScope, clientsList, $state, $stateParams, config, operationService, invoiceService, operation, $modal, $filter, timeEntryService, localStorageService, $timeout, nameQueryService, jnxStorage, driversAndOps, invoices, $mdDialog, $mdToast, dialogService) {

		console.debug('Operation', operation);

		// var dateTimeFormatString = agGridComp.dateTimeCellEditor.formatString;
		var formatStringOnlyHour = agGridComp.dateTimeCellEditor.formatStringOnlyHour;
		var formatStringOnlyDate = agGridComp.dateTimeCellEditor.formatStringOnlyDate;
		var columnsFiltersKey = config.jnxStoreKeys.specialOpsColumnsFilters;
		var findTimeEntries;
		var storedFilterPeriod = jnxStorage.findItem('driversTimeLogFilterPeriod', true);
		var storedTab = jnxStorage.findItem('driverViewSelectedTab', true);
		var timeEntries = [];	// Global time entries object
		var invoiceItemName = 'Total a facturar';

		var operationsWithTimeEntries;

		$scope.cl = clientsList;
		$scope.editMode = false;
		$scope.currentNavItem = (storedTab) ? storedTab : 'summary';
		$scope.editModeInvoiceDetail = false;
		$scope.driversAndOps = driversAndOps;
		$scope.periodFilterKey = (storedFilterPeriod) ? storedFilterPeriod : 'last7Days';
		$scope.periodFilterOptions = config.periodFilterSpecialOps;
		$scope.operationId = $stateParams.id;
		$scope.invoices = invoices;
		$scope.invoice = undefined;

		// console.debug('Invoices', invoices);

		$scope.currentNavItem = (storedTab) ? storedTab : 'summary';
		$scope.driversAndOps = driversAndOps;
		$scope.periodFilterKey = (storedFilterPeriod) ? storedFilterPeriod : 'last7Days';
		$scope.periodFilterOptions = config.periodFilterSpecialOps;
		$scope.operationId = $stateParams.id;

		$scope.periodChange = function () {
			jnxStorage.setItem('driversTimeLogFilterPeriod', $scope.periodFilterKey, true);
			findTimeEntries($scope.periodFilterKey);
		};


		var loadTimeEntries = function () {

			var period;

			if (!_.isNil(operation.end)) {
				period = {
					from: function () {
						return moment().subtract(100, 'year').startOf('day').toDate();
					},
					to  : function () {
						return moment().add(100, 'year').startOf('day').toDate();
					}
				};
				$scope.showTimeSheetPeriodFilterList = false;
			} else {
				var storedFilterPeriod = jnxStorage.findItem('driversTimeLogFilterPeriod', true);
				period = (storedFilterPeriod) ? storedFilterPeriod : 'last7Days';
			}

			findTimeEntries(period);
		};

		$scope.changeTab = function (tab) {
			$scope.currentNavItem = tab;
			if (tab !== 'invoiceDetail') {
				jnxStorage.setItem('driverViewSelectedTab', $scope.currentNavItem, true);
			}
			if (tab === 'time-sheet') {
				$scope.showTimeSheetPeriodFilterList = true;
				loadTimeEntries();
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

			// Fill missing billable flag for some records.
			operation.billable = $scope.data.billable === false ? $scope.data.billable : true;

			// Validate operation
			if (operation.name === '') {
				dialogService.info('services.specialForm.dialogs.nameEmpty');
				return;
			} else if (_.isDate(operation.start) && _.isDate(operation.end)) {
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

			// console.debug('Operation to save', operation);

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

		function deleteConfirmed(rowsToDelete) {


			var timeEntryIds = _.map(rowsToDelete, 'id');
			timeEntryService.removeByIds(timeEntryIds).then(function () {
				// dialogService.info('The records were deleted correctly');
				$scope.gridOptions.api.updateRowData({remove: rowsToDelete});
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
				dialogService.info('operations.dialogs.noRowSelectedError');
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
				field         : 'begin',
				editable      : false,
				filter        : 'date',
				filterParams  : {
					newRowsAction: 'keep',
					comparator   : agGridComp.dateFilterComparator
				},
				valueFormatter: function (params) {
					return (params.data.begin) ? moment(params.data.begin).format(formatStringOnlyHour) : '';
				},
				cellEditor    : agGridComp.dateTimeCellEditor,
				width         : 160
			},
			{
				headerName    : $filter('translate')('operations.specialsTimeLog.endHour'),
				field         : 'end',
				editable      : false,
				filter        : 'date',
				filterParams  : {
					newRowsAction: 'keep',
					comparator   : agGridComp.dateFilterComparator
				},
				valueFormatter: function (params) {
					return (params.data.end) ? moment(params.data.end).format(formatStringOnlyHour) : '';
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
					return operationService.calculateDuration(params.data.begin, params.data.end);
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
				headerName    : $filter('translate')('operations.driversTimeLog.absence'),
				field         : 'absence',
				editable      : false,
				cellEditor    : agGridComp.driverAbsenceCellEditor,
				valueFormatter: function (params) {
					var val = '';
					switch (params.value) {
						case 'D':
							val = $filter('translate')('operations.driversTimeLog.absenceOptions.D');
							break;
						case 'V':
							val = $filter('translate')('operations.driversTimeLog.absenceOptions.V');
							break;
						case 'PS':
							val = $filter('translate')('operations.driversTimeLog.absenceOptions.PS');
							break;
						case 'F':
							val = $filter('translate')('operations.driversTimeLog.absenceOptions.F');
							break;
						case 'PC':
							val = $filter('translate')('operations.driversTimeLog.absenceOptions.PC');
							break;
						case 'I':
							val = $filter('translate')('operations.driversTimeLog.absenceOptions.I');
							break;
						case 'NO_SERVICE_PROVIDED':
							val = $filter('translate')('operations.driversTimeLog.absenceOptions.NO_SERVICE_PROVIDED');
							break;
						default:
							val = '';
							break;
					}
					return val;
				},
				filterParams  : {
					newRowsAction: 'keep',
					textFormatter: function (value) {
						if (value === 'sin falta') {
							return 'SF';
						} else {
							return value;
						}
					}
				},
				width         : 130
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

				// This function is defined to be able to trigger the deletion
				// of the rows from the header component that does not have access
				// to the scope.
				$scope.gridOptions.api.deleteRows = removeSelected;

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
				$rootScope.$emit(config.timeEntry.driver.events.setUpdateMode, rowObj.data);
				// rowObj.node.setRowHeight('45');
				// $scope.gridOptions.api.onRowHeightChanged();
			},
			onRowValueChanged  : function () {
			},
			localeTextFunc     : function (key, defaultValue) {
				var gridKey = 'grid.' + key;
				var value = $filter('translate')(gridKey);
				return value === gridKey ? defaultValue : value;
			},
			onFilterChanged    : function () {
				// Save filters to local storage.
				var savedFilters;
				savedFilters = $scope.gridOptions.api.getFilterModel();
				jnxStorage.setItem(columnsFiltersKey, savedFilters, true);
				// console.debug('savedFilters' + JSON.stringify(savedFilters));
			},
			onRowSelected      : function () {
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

		// Load time entries
		findTimeEntries = function (period) {

			if (_.isString(period)) {
				period = timePeriods.specialOps[period];
			}
			// Load data
			operationService.findWithTimeEntriesByIdsAndDate([$stateParams.id], period.from(), period.to()).then(function (result) {
				operationsWithTimeEntries = result;
				timeEntries = result.length > 0 && _.isArray(result[0].schedule) ? result[0].schedule : [];
				console.debug('Loaded time entries', timeEntries);
				const ids = _.map(timeEntries, function (o) {
					return o.id;
				});
				return invoiceService.findInvoiceNumbersByIdTimeEntries(ids);
			}).then(function (result) {
				// timeEntries = invoiceService.mapTimeEntryDataAndInvoices(timeEntries, result);
				var mappedValuesForAgGrid = operationService.mapTimeEntryData(operationsWithTimeEntries);
				var mappedValuesWithInvoiceInfo = invoiceService.mapTimeEntryDataAndInvoices(mappedValuesForAgGrid, result);
				$scope.gridOptions.api.setRowData(mappedValuesWithInvoiceInfo);
				agGridSizeToFit();
			});
		};
		$scope.findTimeEntries = loadTimeEntries;

		// If we are on time sheet tab initially
		if ($scope.currentNavItem === 'time-sheet') {
			$scope.showTimeSheetPeriodFilterList = true;
			loadTimeEntries();
		}


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

		// Return true if time entries ids haven't been related to any invoice, otherwise return false
		var checkTEBeforeInsertToInvoice = function (timeEntriesIds) {
			return invoiceService.findInvoiceNumbersByIdTimeEntries(timeEntriesIds).then(function (result) {
				// console.debug('Time entries related to invoice', result);
				return _.every(result, function (timeEntry) {
					return (_.isNil(timeEntry.invoice));
				});
			});
		};

		var agGridRowsToTE = function (selectedRows) {
			var invoiceItemsTE = [];
			var timeEntryIds = [];

			// Map ag-grid rows into item time entry objects
			selectedRows.forEach(function (agGridRow) {
				invoiceItemsTE.push({
					doNotInvoice       : false,
					doNotInvoiceVehicle: false,
					timeEntry          : _.find(timeEntries, {id: agGridRow.id}),
					total              : 0
				});
				timeEntryIds.push(agGridRow.id);
			});
			return {timeEntryIds: timeEntryIds, invoiceItemsTE: invoiceItemsTE};
		};

		$scope.showAddToNewInvoicePopup = function () {
			// Show popup.
			$mdDialog.show({
				clickOutsideToClose: true,
				templateUrl        : 'app/services/add-new-invoice.html',
				scope              : $scope,
				preserveScope      : true,
				controller         : ['$scope', '$mdDialog', 'invoiceService', 'config', function ($scope, $mdDialog, invoiceService, config) {
					console.debug('config.invoice.status.inRevision', config.invoice.status.inRevision);
					$scope.newInvoiceNumber = '';
					$scope.newInvoiceDate = '';

					$scope.closeAddNewInvoice = function () {
						$mdDialog.hide();
					};

					$scope.createNewInvoice = function () {
						var selectedRows = $scope.gridOptions.api.getSelectedRows();
						if (selectedRows.length > 0) {
							var agRowsToTE = agGridRowsToTE(selectedRows);

							checkTEBeforeInsertToInvoice(agRowsToTE.timeEntryIds).then(function (checkTEResult) {
								if (checkTEResult) {
									if ($scope.newInvoiceNumber !== '') {
										if ($scope.newInvoiceDate !== '') {
											$mdDialog.hide();

											var newInvoice = {
												client            : operation.client.object,
												invoiceNumber     : $scope.newInvoiceNumber,
												invoiceDate       : $scope.newInvoiceDate,
												comments          : '',
												items             : [],
												status            : config.invoice.status.inRevision,
												discount          : 0,
												discountPercentage: 0
											};

											var newItem = {
												itemNumber : 1,
												name       : invoiceItemName,
												timeEntries: []
											};

											// Create invoice and add time entries
											invoiceService.insertInvoiceAndItem(newInvoice, newItem).then(function (result) {
												console.debug('Invoice created result', result);
												invoiceService.insertInvoiceItemTimeEntry(newInvoice.invoiceNumber, newItem.name, agRowsToTE.invoiceItemsTE).then(function (insertedTimeEntries) {
													console.debug('Inserted time entries', insertedTimeEntries);
													$mdToast.show(
														$mdToast.simple()
															.textContent($filter('translate')('services.invoice.dialogs.insertTimeEntries'))
															.position('top right')
															.hideDelay(3000)
													);
													updateInvoiceList();
												});
											});
										} else {
											dialogService.info('services.invoice.dialogs.missingInvoiceDate');
										}
									} else {
										dialogService.info('services.invoice.dialogs.missingInvoiceNumber');
									}
								} else {
									dialogService.info('services.invoice.dialogs.insertTimeEntriesInvoiceError');
								}
							});
						} else {
							dialogService.info('services.invoice.dialogs.noRowsSelected');
						}
					};
				}]
			});
		};

		$scope.addTimeEntriesToInvoice = function (invoiceNumber) {
			var selectedRows = $scope.gridOptions.api.getSelectedRows();
			if (selectedRows.length > 0) {
				var agRowsToTE = agGridRowsToTE(selectedRows);

				checkTEBeforeInsertToInvoice(agRowsToTE.timeEntryIds).then(function (checkTEResult) {
					if (checkTEResult) {
						invoiceService.insertInvoiceItemTimeEntry(invoiceNumber, invoiceItemName, agRowsToTE.invoiceItemsTE).then(function (insertedTimeEntries) {
							console.debug('Inserted invoice time entries', insertedTimeEntries);
							$mdToast.show(
								$mdToast.simple()
									.textContent($filter('translate')('services.invoice.dialogs.insertTimeEntries'))
									.position('top right')
									.hideDelay(3000)
							);
							updatedSelectedInvoice(invoiceNumber);
							updateInvoiceList();
						});
					} else {
						dialogService.info('services.invoice.dialogs.insertTimeEntriesInvoiceError');
					}
				});
			} else {
				dialogService.info('services.invoice.dialogs.noRowsSelected');
			}
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

		/*
		* Special ops side panel
		*/

		$scope.insertNewTimeEntry = function () {
			console.debug('Call to insertNewTimeEntry');
			$scope.gridOptions.api.stopEditing();
			// Sends an event to the side panel indicating the user wants to insert or update the
			// time entry
			$rootScope.$emit(config.timeEntry.driver.events.setInsertMode, $scope.operationId);
		};

		$scope.export = function () {
			var ids = [];
			$scope.gridOptions.api.forEachNodeAfterFilter(function (item) {
				ids.push(item.data.id);
			});
			timeEntryService.timeEntryReport(ids);
		};

		/*****
		 * EVENTS.
		 * Given the time entries are modified using a different controller the following events are defined.
		 * In order to know when the user modified the time entry.
		 *****/

		/**
		 * This event is captured here when the user has inserted or updated successfully a time entry using the side panel.
		 */
		$scope.$on(config.timeEntry.driver.events.doneInsertOrUpdate, function () {
			findTimeEntries($scope.periodFilterKey);
			// Update invoice list.
			updateInvoiceList();
		});

		/**
		 * This event is captured when the user decided to cancel any changes in the special ops side panel.
		 */
		$scope.$on(config.timeEntry.driver.events.canceled, function () {
			$scope.gridOptions.api.stopEditing();
		});
	}];
