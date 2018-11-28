'use strict';

var moment = require('moment');
var _ = require('lodash');
var agGridComp = require('common/ag-grid-components');
var timePeriods = require('common/time-periods');

module.exports = ['$rootScope', '$scope', 'config', 'jnxStorage', 'operationService', 'resourceService', '$timeout', '$modal', '$interval', 'driversAndOps', 'timeEntries', 'timeEntryService', '$filter', '$state', '$translate', 'nameQueryService', 'dialogService',
	function ($rootScope, $scope, config, jnxStorage, operationService, resourceService, $timeout, $modal, $interval, driversAndOps, timeEntries, timeEntryService, $filter, $state, $translate, nameQueryService, dialogService) {

		var storedFilterPeriod = jnxStorage.findItem(config.jnxStoreKeys.driversTimeLogFilterPeriod, true);
		var columnsFiltersKey = config.jnxStoreKeys.driversColumnsFilters;
		$scope.driversAndOps = driversAndOps;
		$scope.periodFilterKey = (storedFilterPeriod) ? storedFilterPeriod : 'last7Days';
		$scope.periodFilterOptions = config.periodFilter;
		$scope.lang = $translate.use();

		$scope.periodChange = function () {
			jnxStorage.setItem('driversTimeLogFilterPeriod', $scope.periodFilterKey, true);
			$scope.findTimeEntries($scope.periodFilterKey);
		};

		var formatStringOnlyDate = agGridComp.dateTimeCellEditor.formatStringOnlyDate;
		var formatStringOnlyHour = agGridComp.dateTimeCellEditor.formatStringOnlyHour;

		$scope.export = function () {

			var ids = [];

			$scope.gridOptions.api.forEachNodeAfterFilter(function (item) {
				ids.push(item.data.id);
			});
			timeEntryService.timeEntryReport(ids);
		};

		$scope.insertNewTimeEntry = function () {
			$scope.gridOptions.api.stopEditing();
			$rootScope.$emit(config.timeEntry.driver.events.setInsertMode);
		};

		function deleteConfirmed(rowsToDelete) {
			var timeEntryIds = _.map(rowsToDelete, 'id');
			timeEntryService.removeByIds(timeEntryIds).then(function () {
				$scope.gridOptions.api.updateRowData({remove: rowsToDelete});
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
				dialogService.info('operations.dialogs.noRowSelectedError');
			}
		};

		//
		// AG-Grid
		//
		var columnDefs = [
			{
				headerName  : $filter('translate')('operations.driversTimeLog.staff'),
				field       : 'staff',
				editable    : false,
				// cellRenderer: agGridComp.staffCellRenderer,
				valueGetter : function (params) {
					var result;
					if (_.isNil(params.data.staff)) {
						result = '';
					} else {
						result = params.data.staff.resource;
						result = nameQueryService.createLongNameLocalized(result);
					}
					return result;
				},
				cellEditor  : agGridComp.autocompleteStaffCellEditor,
				filter      : 'agTextColumnFilter',
				filterParams: {newRowsAction: 'keep'}
			},
			{
				headerName  : $filter('translate')('operations.driversTimeLog.operation'),
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
				headerName  : $filter('translate')('operations.driversTimeLog.client'),
				field       : 'code',
				editable    : false,
				cellEditor  : agGridComp.clientCellUpdater,
				filter      : 'agTextColumnFilter',
				filterParams: {newRowsAction: 'keep'},
				valueGetter : function (params) {
					var result;
					if (_.isNil(params.data.code)) {
						result = params.data.client;
					} else {
						result = params.data.code;
					}
					return result;
				}
			},
			{
				headerName    : $filter('translate')('operations.driversTimeLog.begin'),
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
				headerName    : $filter('translate')('operations.driversTimeLog.begin'),
				field         : 'begin',
				editable      : false,
				valueFormatter: function (params) {
					return (params.data.begin) ? moment(params.data.begin).format(formatStringOnlyHour) : '';
				},
				sort          : 'desc',
				width         : 160
			},

			{
				headerName    : $filter('translate')('operations.driversTimeLog.end'),
				field         : 'end',
				editable      : false,
				valueFormatter: function (params) {
					return (params.data.end) ? moment(params.data.end).format(formatStringOnlyHour) : '';
				},
				width         : 160
			},
			{
				headerName: $filter('translate')('operations.driversTimeLog.duration'),
				field     : 'duration',
				editable  : false,
				cellEditor: agGridComp.durationCellUpdater,
				width     : 95
			},
			{
				headerName    : $filter('translate')('operations.driversTimeLog.comment'),
				field         : 'comment',
				editable      : false,
				cellEditor    : agGridComp.commentCellEditor,
				cellStyle     : {
					'white-space': 'normal'
				},
				valueFormatter: function (params) {
					var maxLength = 35;
					var comment = params.data.comment;
					return _.isString(comment) ? agGridComp.util.truncate(comment, maxLength, '...') : '';
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
				headerName     : '',
				cellRenderer   : agGridComp.checkBoxRowSelection,
				// cellEditor     : agGridComp.rowActions,
				headerComponent: agGridComp.deleteRowsHeaderComponent,
				editable       : false,
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
				$rootScope.$emit(config.timeEntry.driver.events.setUpdateMode, rowObj.data);
			},
			onRowValueChanged        : function () {

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
				// console.log('savedFilters' + JSON.stringify(savedFilters));
			}

		};

		$scope.findTimeEntries = function (periodKey) {
			var period = timePeriods.nonSpecialOps[periodKey];

			operationService.findWithTimeEntriesByDateBetweenAndTypeByAuthenticatedUser(period.from(), period.to(), 'DRIVER')
				.then(function (result) {
					// console.log(JSON.stringify(result));
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


		/*****
		 * EVENTS.
		 * Given the time entries are modified using a different controller the following events are defined.
		 * In order to know when the user modified the time entry.
		 *****/

		/**
		 * This event is captured here when the user has inserted or updated successfully a time entry using the side panel.
		 */
		$scope.$on(config.timeEntry.driver.events.doneInsertOrUpdate, function () {
			$scope.findTimeEntries($scope.periodFilterKey);
			$scope.gridOptions.api.stopEditing();
		});

		/**
		 * This event is captured when the user decided to cancel any changes in the special ops side panel.
		 */
		$scope.$on(config.timeEntry.driver.events.canceled, function () {
			$scope.gridOptions.api.stopEditing();
		});

	}];
