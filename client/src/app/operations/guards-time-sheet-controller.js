'use strict';

var moment = require('moment');
var _ = require('lodash');
var agGridComp = require('common/ag-grid-components');
var timePeriods = require('common/time-periods');

module.exports = ['$rootScope', '$scope', 'config', 'jnxStorage', 'operationService', 'resourceService', '$q', '$timeout', '$modal', '$interval', 'driversAndOps', 'timeEntries', 'timeEntryService', '$filter', '$state', '$translate', 'nameQueryService', 'dialogService',
	function ($rootScope, $scope, config, jnxStorage, operationService, resourceService, $q, $timeout, $modal, $interval, driversAndOps, timeEntries, timeEntryService, $filter, $state, $translate, nameQueryService, dialogService) {

		var storedFilterPeriod = jnxStorage.findItem(config.jnxStoreKeys.guardsTimeLogFilterPeriod, true);
		var columnsFiltersKey = config.jnxStoreKeys.guardsColumnsFilters;
		$scope.driversAndOps = driversAndOps;
		$scope.periodFilterKey = (storedFilterPeriod) ? storedFilterPeriod : 'last7Days';
		var formatStringOnlyHour = agGridComp.dateTimeCellEditor.formatStringOnlyHour;
		var formatStringOnlyDate = agGridComp.dateTimeCellEditor.formatStringOnlyDate;


		$scope.periodFilterOptions = config.periodFilter;
		$scope.lang = $translate.use();

		$scope.periodChange = function () {
			jnxStorage.setItem('guardsTimeLogFilterPeriod', $scope.periodFilterKey, true);
			$scope.findTimeEntries($scope.periodFilterKey);
		};

		$scope.export = function () {
			var ids = [];
			$scope.gridOptions.api.forEachNodeAfterFilter(function (item) {
				ids.push(item.data.id);
			});
			timeEntryService.timeEntryReportGuard(ids);
		};

		function deleteConfirmed(rowsToDelete) {
			$scope.gridOptions.api.updateRowData({remove: rowsToDelete});

			var timeEntryIds = _.map(rowsToDelete, 'id');
			timeEntryService.removeByIds(timeEntryIds).then(function () {
				// dialogService.info('The records were deleted correctly');
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
				headerName  : $filter('translate')('operations.guardsTimeLog.staff'),
				field       : 'staff',
				editable    : false,
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
				headerName  : $filter('translate')('operations.guardsTimeLog.operation'),
				field       : 'operation',
				editable    : false,
				valueGetter : function (params) {
					return params.data.operation.name;
				},
				cellEditor  : agGridComp.autocompleteOpCellEditor,
				width       : 130,
				filter      : 'agTextColumnFilter',
				filterParams: {newRowsAction: 'keep'}
			},
			{
				headerName  : $filter('translate')('operations.guardsTimeLog.client'),
				field       : 'code',
				editable    : false,
				cellEditor  : agGridComp.clientCellUpdater,
				width       : 110,
				filter      : 'agTextColumnFilter',
				filterParams: {newRowsAction: 'keep'},
				valueGetter : function (params) {
					var result;
					if (_.isString(params.data.code) && params.data.code !== '') {
						result = params.data.code;
					} else {
						result = params.data.client;
					}
					return result;
				}
			},

			// Extras
			{
				headerName    : $filter('translate')('operations.guardsTimeLog.extras'),
				field         : 'extras',
				editable      : false,
				cellEditor    : agGridComp.guardExtraCellEditor,
				valueFormatter: function (params) {
					var val = '';
					switch (params.value) {
						case 'AF':
							val = $filter('translate')('operations.guardsTimeLog.extraOptions.AF');
							break;
						case 'A':
							val = $filter('translate')('operations.guardsTimeLog.extraOptions.A');
							break;
						case 'NM':
							val = $filter('translate')('operations.guardsTimeLog.extraOptions.NM');
							break;
						case 'NRM':
							val = $filter('translate')('operations.guardsTimeLog.extraOptions.NRM');
							break;
						case 'CLOSED':
							val = $filter('translate')('operations.guardsTimeLog.extraOptions.CLOSED');
							break;
						case 'NOT COVERED':
							val = $filter('translate')('operations.guardsTimeLog.extraOptions.NOT_COVERED');
							break;
						case 'GUARD_SHIFT_MANAGER':
							val = $filter('translate')('operations.guardsTimeLog.extraOptions.GUARD_SHIFT_MANAGER');
							break;
						default:
							val = '';
							break;
					}
					return val;
				},
				filterParams  : {
					newRowsAction       : 'keep',
					textCustomComparator: function (filter, gridValue, filterText) {

						var filterTextLoweCase = filterText.toLowerCase();
						var valueLowerCase = _.isNil(gridValue) ? gridValue : gridValue.toString().toLowerCase();
						if (filterTextLoweCase === 'base' && (valueLowerCase === 'BASE'.toLowerCase() || valueLowerCase === 'GUARD_SHIFT_MANAGER'.toLowerCase())) {
							switch (filter) {
								case 'contains':
									return true;
								case 'notContains':
									return false;
								case 'equals':
									return true;
								case 'notEqual':
									return false;
								case 'startsWith':
									return true;
								case 'endsWith':
									return true;
								default:
									// should never happen
									console.warn('invalid filter type ' + filter);
									return false;
							}
						}
						switch (filter) {
							case 'contains':
								return valueLowerCase.indexOf(filterTextLoweCase) >= 0;
							case 'notContains':
								return valueLowerCase.indexOf(filterTextLoweCase) === -1;
							case 'equals':
								return valueLowerCase === filterTextLoweCase;
							case 'notEqual':
								return valueLowerCase !== filterTextLoweCase;
							case 'startsWith':
								return valueLowerCase.indexOf(filterTextLoweCase) === 0;
							case 'endsWith':
								var index = valueLowerCase.lastIndexOf(filterTextLoweCase);
								return index >= 0 && index === (valueLowerCase.length - filterTextLoweCase.length);
							default:
								// should never happen
								console.warn('invalid filter type ' + filter);
								return false;
						}

					}
				},
				width         : 170
			},
			{
				headerName    : $filter('translate')('operations.guardsTimeLog.date'),
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
				width         : 120
			},
			{
				headerName    : $filter('translate')('operations.guardsTimeLog.begin'),
				field         : 'begin',
				editable      : false,
				valueFormatter: function (params) {
					return (params.data.begin) ? moment(params.data.begin).format(formatStringOnlyHour) : '';
				},
				sort          : 'desc',
				width         : 90
			},
			{
				headerName    : $filter('translate')('operations.guardsTimeLog.end'),
				field         : 'end',
				editable      : false,
				valueFormatter: function (params) {
					return (params.data.end) ? moment(params.data.end).format(formatStringOnlyHour) : '';
				},
				width         : 90
			},
			{
				headerName: $filter('translate')('operations.guardsTimeLog.duration'),
				field     : 'duration',
				editable  : true,
				cellEditor: agGridComp.durationCellUpdater,
				width     : 95
			},
			{
				headerName    : $filter('translate')('operations.guardsTimeLog.comment'),
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
				headerName     : $filter('translate')('operations.guardsTimeLog.isExternal'),
				editable       : false,
				cellEditor     : agGridComp.checkBoxCellEditor,
				suppressSorting: true,
				suppressMenu   : true,
				field          : 'isExternal',
				valueFormatter : function (params) {
					if (params.value === true) {
						return $filter('translate')('operations.guardsTimeLog.isExternal');
					} else {
						return '';
					}
				},
				width          : 80
			},
			{
				headerName     : '',
				cellRenderer   : agGridComp.checkBoxRowSelection,
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
				// console.log('Row edition started', rowObj);
				$rootScope.$emit(config.timeEntry.guard.events.setUpdateMode, rowObj.data);
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

			operationService.findWithTimeEntriesByDateBetweenAndTypeByAuthenticatedUser(period.from(), period.to(), 'GUARD')
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
			// console.log('$translateChangeSuccess');
			$state.reload();
		});

		//
		// End of AG-Grid
		//

		$scope.insertNewTimeEntry = function () {
			$scope.gridOptions.api.stopEditing();
			$rootScope.$emit(config.timeEntry.guard.events.setInsertMode);
		};


		$scope.$on(config.timeEntry.guard.events.doneInsertOrUpdate, function () {
			$scope.findTimeEntries($scope.periodFilterKey);
			$scope.gridOptions.api.stopEditing();
		});

		/**
		 * This event is captured when the user decided to cancel any changes in the special ops side panel.
		 */
		$scope.$on(config.timeEntry.guard.events.canceled, function () {
			$scope.gridOptions.api.stopEditing();
		});

	}];
