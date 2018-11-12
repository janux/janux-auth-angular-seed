'use strict';

var moment = require('moment');
var _ = require('lodash');
var agGridComp = require('common/ag-grid-components');
var timePeriods = require('common/time-periods');

module.exports = ['$rootScope', '$scope', 'config', 'jnxStorage', 'operationService', '$timeout', '$modal', 'driversAndOps', 'timeEntries', 'timeEntryService', '$filter', '$state', '$translate', 'nameQueryService', 'dialogService',
	function ($rootScope, $scope, config, jnxStorage, operationService, $timeout, $modal, driversAndOps, timeEntries, timeEntryService, $filter, $state, $translate, nameQueryService, dialogService) {

		var storedFilterPeriod = jnxStorage.findItem(config.jnxStoreKeys.specialOpsTimeLogFilterPeriod, true);
		var columnsFiltersKey = config.jnxStoreKeys.specialOpsColumnsFilters;
		var findTimeEntries;
		$scope.driversAndOps = driversAndOps;
		//$scope.periodFilterKey = undefined;
		$scope.periodFilterKey = (storedFilterPeriod) ? storedFilterPeriod : 'last7Days';
		$scope.periodFilterOptions = config.periodFilterSpecialOps;
		$scope.lang = $translate.use();

		// var dateTimeFormatString = agGridComp.dateTimeCellEditor.formatString;
		var formatStringOnlyDate = agGridComp.dateTimeCellEditor.formatStringOnlyDate;
		var formatStringOnlyHour = agGridComp.dateTimeCellEditor.formatStringOnlyHour;

		$scope.export = function () {
			var ids = [];
			$scope.gridOptions.api.forEachNodeAfterFilter(function (item) {
				ids.push(item.data.id);
			});

			timeEntryService.timeEntryReportSpecialOps(ids);
		};

		$scope.periodChange = function () {
			console.debug('All options ' + JSON.stringify($scope.periodFilterOptions));
			console.debug('$scope.periodFilterKey ' + $scope.periodFilterKey);
			jnxStorage.setItem(config.jnxStoreKeys.specialOpsTimeLogFilterPeriod, $scope.periodFilterKey, true);
			findTimeEntries($scope.periodFilterKey);
		};

		function deleteConfirmed(rowsToDelete) {
			var timeEntryIds = _.map(rowsToDelete, 'id');
			timeEntryService.removeByIds(timeEntryIds).then(function () {
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
				dialogService.info('operations.dialogs.noRowSelectedError', false);
			}
		};
		//
		// AG-Grid
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
				headerName  : $filter('translate')('operations.specialsTimeLog.operation'),
				field       : 'operation',
				editable    : false,
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
				editable      : false,
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
				headerName  : $filter('translate')('operations.specialsTimeLog.client'),
				editable    : false,
				cellEditor  : agGridComp.clientCellUpdater,
				filter      : 'agTextColumnFilter',
				filterParams: {newRowsAction: 'keep'},
				valueGetter : function (params) {
					var client = params.data.operation.client;
					return _.isNil(client.code) || client.code === '' ? client.name : client.code;
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
				headerName    : $filter('translate')('operations.specialsTimeLog.beginHourWork'),
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
				headerName    : $filter('translate')('operations.specialsTimeLog.endHourWork'),
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
				headerName: $filter('translate')('operations.specialsTimeLog.duration'),
				field     : 'duration',
				editable  : false,
				cellEditor: agGridComp.durationCellUpdater,
				width     : 95
			},

			{
				headerName    : $filter('translate')('operations.specialsTimeLog.comment'),
				field         : 'comment',
				editable      : false,
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
				editable      : false,
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
				// cellEditor     : agGridComp.rowActions,
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
				var filterModel = jnxStorage.findItem(columnsFiltersKey, true);
				if (!_.isNil(filterModel)) {
					$scope.gridOptions.api.setFilterModel(filterModel);
					$scope.gridOptions.onFilterChanged();
				}
			},
			onRowEditingStarted      : function (rowObj) {
				// Nothing to do yet
				console.debug('Row edition started', rowObj);
				// Send the event to the side panel indicating the user wants to update the time entry.
				$rootScope.$emit(config.timeEntry.specialOps.events.setUpdateMode, rowObj.data);
			},
			onRowValueChanged        : function (rowObj) {
				console.debug('Row data changed', rowObj);
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
				jnxStorage.setItem(columnsFiltersKey, savedFilters, true);
				console.debug('savedFilters' + JSON.stringify(savedFilters));
			}
		};

		findTimeEntries = function (periodKey) {
			console.debug('Call findTimeEntries with periodKey: %s ', periodKey);
			var period = timePeriods.specialOps[periodKey];
			operationService.findWithTimeEntriesByDateBetweenAndTypeByAuthenticatedUser(period.from(), period.to(), 'SPECIAL_OPS')
				.then(function (result) {
					console.debug('Result of findWithTimeEntriesByDateBetweenAndTypeByAuthenticatedUser: \n  %o', result);
					var agGridRecords = operationService.mapTimeEntryData(result);

					//Now put the ag-grid ready records to the ui.
					$scope.gridOptions.api.setRowData(agGridRecords);
				});

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
		 * This method is called when the user wants to insert a new time entry.
		 */
		$rootScope.insertNewTimeEntry = function () {
			// Send an event to open the side panel with a clean form.
			$scope.$emit(config.timeEntry.specialOps.events.setInsertMode);
		};

		/*****
		 * EVENTS.
		 * Given the time entries are modified using a different controller the following events are defined.
		 * In order to know when the user modified the time entry.
		 *****/

		/**
		 * This event is catch here when the user has inserted or updated successfully a time entry using the side panel.
		 */
		$rootScope.$on(config.timeEntry.specialOps.events.doneInsertOrUpdate, function () {
			findTimeEntries($scope.periodFilterKey);
			$scope.gridOptions.api.stopEditing();
		});

		/**
		 * This event is captured when the user decided to cancel any changes in the special ops side panel.
		 */
		$rootScope.$on(config.timeEntry.specialOps.events.canceled, function () {
			$scope.gridOptions.api.stopEditing();
		});

	}];
