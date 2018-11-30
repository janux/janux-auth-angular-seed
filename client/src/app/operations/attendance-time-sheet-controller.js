'use strict';

var moment = require('moment');
var _ = require('lodash');
var agGridComp = require('common/ag-grid-components');
var timePeriods = require('common/time-periods');

module.exports = ['$rootScope', '$scope', '$log', 'config', 'jnxStorage', 'operationService', 'resourceService', '$q', '$timeout', '$modal', '$interval', 'driversAndOps', 'timeEntries', 'timeEntryService', '$filter', '$state', '$translate', 'nameQueryService',
	function ($rootScope, $scope, $log, config, jnxStorage, operationService, resourceService, $q, $timeout, $modal, $interval, driversAndOps, timeEntries, timeEntryService, $filter, $state, $translate, nameQueryService) {

		var storedFilterPeriod = jnxStorage.findItem(config.jnxStoreKeys.attendanceTimeLogFilterPeriod, true);
		var columnsFiltersKey = config.jnxStoreKeys.attendanceColumnsFilters;
		$scope.driversAndOps = driversAndOps;
		$scope.periodFilterKey = (storedFilterPeriod) ? storedFilterPeriod : 'last7Days';
		$scope.periodFilterOptions = config.periodFilter;
		$scope.lang = $translate.use();
		$scope.operation = $scope.driversAndOps.operation;
		$scope.selectedStaffSearch = undefined;

		$scope.periodChange = function () {
			jnxStorage.setItem('attendanceTimeLogFilterPeriod', $scope.periodFilterKey, true);
			$scope.findTimeEntries($scope.periodFilterKey, $scope.selectedStaffSearch);
		};

		var dateTimeFormatString = agGridComp.dateTimeCellEditor.formatString;
		var allStaff = driversAndOps.allPersonnelAvailableForSelection;


		// var initRowModel = function () {
		// 	$scope.lbRow = {
		// 		staff    : '',
		// 		operation: '',
		// 		start    : moment().startOf('day').format(dateTimeFormatString),
		// 		end      : undefined,
		// 		location : '',
		// 		absence  : ''
		// 	};
		// };
		// initRowModel();

		// Models used when entering the search query for the autocomplete fields
		$scope.lbSearch = {
			staff    : '',
			operation: '',
			provider : ''
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


		//
		// Staff autocomplete
		//
		$scope.staffSearchSelectedItemChange = function (item) {
			$scope.selectedStaffSearch = item;
			$scope.findTimeEntries($scope.periodFilterKey, $scope.selectedStaffSearch);

		};

		$scope.findTimeEntries = function (periodKey, resource) {
			var period = timePeriods.nonSpecialOps[periodKey];
			var promise;
			if (_.isNil(resource)) {
				$log.debug('Calling filter with no person');
				promise = operationService.findWithTimeEntriesByDateBetweenAndVendor(period.from(), period.to(), config.glarus);
			} else {
				$log.debug('Calling filter with person');
				promise = operationService.findWithTimeEntriesByDateAndPartyAndType(period.from(), period.to(), resource.resource.id, undefined);
			}

			promise.then(function (result) {
				// console.log(JSON.stringify(result));
				var agGridRecords = operationService.mapTimeEntryData(result);

				//Now put the ag-grid ready records to the ui.
				$scope.gridOptions.api.setRowData(agGridRecords);
			});

		};


		$scope.staffInsertSelectedItemChange = function (item) {
			console.log('item   ' + JSON.stringify(item));
		};


		$scope.staffSearch = function (query) {
			return query ? allStaff.filter(nameQueryService.createFilterForStaff(query)) : allStaff;
		};

		$scope.export = function () {

			var ids = [];

			$scope.gridOptions.api.forEachNodeAfterFilter(function (item) {
				ids.push(item.data.id);
			});

			timeEntryService.timeEntryReportAttendance(ids);

		};


		function deleteConfirmed(rowsToDelete) {

			var timeEntryIds = _.map(rowsToDelete, 'id');
			timeEntryService.removeByIds(timeEntryIds).then(function () {
				// infoDialog('The records were deleted correctly');
				$scope.gridOptions.api.updateRowData({remove: rowsToDelete});
			});
		}

		// Remove selected records
		var removeSelected = function () {
			var selectedData = $scope.gridOptions.api.getSelectedRows();

			//TODO: Validate only attendance rows.

			if (selectedData.length > 0) {
				$modal.open({
					templateUrl: 'app/dialog-tpl/confirm-dialog.html',
					controller : ['$scope', '$modalInstance',
						function ($scope, $modalInstance) {
							$scope.message = $filter('translate')('operations.dialogs.confirmDe;letion');

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
				headerName  : $filter('translate')('operations.attendanceTimeLog.staff'),
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
				headerName  : $filter('translate')('operations.attendanceTimeLog.operation'),
				field       : 'operation',
				editable    : false,
				valueGetter : function (params) {
					return params.data.operation.name;
				},
				cellEditor  : agGridComp.autocompleteOpCellEditor,
				width       : 110,
				filter      : 'agTextColumnFilter',
				filterParams: {newRowsAction: 'keep'}
			},

			{
				headerName    : $filter('translate')('operations.attendanceTimeLog.operationType'),
				field         : 'operationType',
				editable      : false,
				valueFormatter: function (params) {
					var val = '';
					switch (params.data.operation.type) {
						case 'DRIVER':
							val = $filter('translate')('operations.attendanceTimeLog.operationTypeDriver');
							break;
						case 'GUARD':
							val = $filter('translate')('operations.attendanceTimeLog.operationTypeGuard');
							break;
						case 'SPECIAL_OPS':
							val = $filter('translate')('operations.attendanceTimeLog.operationTypeSpecialOps');
							break;
						case 'ATTENDANCE':
							val = $filter('translate')('operations.attendanceTimeLog.operationTypeAttendance');
							break;
						default:
							val = '';
							break;
					}
					return val;
				}
			},
			{
				headerName    : $filter('translate')('operations.attendanceTimeLog.begin'),
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
					return (params.data.begin) ? moment(params.data.begin).format(dateTimeFormatString) : '';
				},
				cellEditor    : agGridComp.dateTimeCellEditor,
				sort          : 'desc',
				width         : 160
			},
			{
				headerName    : $filter('translate')('operations.attendanceTimeLog.end'),
				field         : 'end',
				editable      : false,
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
				headerName: $filter('translate')('operations.attendanceTimeLog.duration'),
				field     : 'duration',
				editable  : false,
				cellEditor: agGridComp.durationCellUpdater,
				width     : 95
			},
			{
				headerName   : $filter('translate')('operations.attendanceTimeLog.comment'),
				field        : 'comment',
				editable     : false,
				cellEditor   : agGridComp.commentCellEditor,
				cellStyle    : {
					'white-space': 'normal'
				},
				cellFormatter: function (params) {
					var maxLength = 35;
					var comment = params.data.comment;
					return _.isString(comment) ? agGridComp.util.truncate(comment, maxLength, '...') : '';
				}
			},
			{
				headerName    : $filter('translate')('operations.attendanceTimeLog.absence'),
				field         : 'absence',
				editable      : false,
				cellEditor    : agGridComp.absenceCellEditor,
				valueFormatter: function (params) {
					var val = '';
					switch (params.value) {
						case 'D':
							val = $filter('translate')('operations.attendanceTimeLog.absenceOptions.D');
							break;
						case 'V':
							val = $filter('translate')('operations.attendanceTimeLog.absenceOptions.V');
							break;
						case 'F':
							val = $filter('translate')('operations.attendanceTimeLog.absenceOptions.F');
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
				// headerCheckboxSelection: true,
				// headerCheckboxSelectionFilteredOnly: true,
				// checkboxSelection: true,
				cellRenderer   : agGridComp.checkBoxRowSelection,
				cellEditor     : agGridComp.rowActions,
				headerComponent: agGridComp.deleteRowsHeaderComponent,
				editable       : false,
				field          : 'selected',	// field needed to avoid ag-grid warning
				width          : 80
			}
		];

		var agGridSizeToFit = function () {
			$timeout(function () {
				$scope.gridOptions.api.sizeColumnsToFit();
			}, 500);
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
				// Validate if operation is attendance type
				var operation = rowObj.data.operation;
				if (operation.type === 'ATTENDANCE'){
					$rootScope.$emit(config.timeEntry.attendance.events.setUpdateMode, rowObj.data);
				}else{
					infoDialog('operations.dialogs.invalidOperationForAttendance');
				}
			},
			onRowValueChanged        : function (rowObj) {
				//console.log('Row data changed', rowObj);
			},

			localeTextFunc : function (key, defaultValue) {
				var gridKey = 'grid.' + key;
				var value = $filter('translate')(gridKey);
				return value === gridKey ? defaultValue : value;
			},
			onFilterChanged: function () {
				// Save filters to local storage.
				var savedFilters;
				savedFilters = $scope.gridOptions.api.getFilterModel();
				jnxStorage.setItem(columnsFiltersKey, savedFilters, true);
				// console.log('savedFilters' + JSON.stringify(savedFilters));
			}
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

		$scope.insertNewTimeEntry = function () {
			$scope.gridOptions.api.stopEditing();
			$rootScope.$emit(config.timeEntry.attendance.events.setInsertMode);
		};


		$scope.$on(config.timeEntry.attendance.events.doneInsertOrUpdate, function () {
			$scope.findTimeEntries($scope.periodFilterKey);
			$scope.gridOptions.api.stopEditing();
		});

		/**
		 * This event is captured when the user decided to cancel any changes in the special ops side panel.
		 */
		$scope.$on(config.timeEntry.attendance.events.canceled, function () {
			$scope.gridOptions.api.stopEditing();
		});
	}];
