'use strict';

var moment = require('moment');
var _ = require('lodash');
var agGridComp = require('common/ag-grid-components');
var timePeriods = require('common/time-periods');

module.exports = ['$rootScope', '$scope', '$mdDialog', 'config', 'jnxStorage', 'operationService', 'resourceService', '$q', '$timeout', '$modal', '$interval', 'driversAndOps', 'timeEntries', 'timeEntryService', '$filter', '$state', '$translate', 'nameQueryService', 'operationUtilService', 'dialogService',
	function ($rootScope, $scope, $mdDialog, config, jnxStorage, operationService, resourceService, $q, $timeout, $modal, $interval, driversAndOps, timeEntries, timeEntryService, $filter, $state, $translate, nameQueryService, operationUtilService, dialogService) {

		var storedFilterPeriod = jnxStorage.findItem(config.jnxStoreKeys.specialOpsTimeLogFilterPeriod, true);
		var columnsFiltersKey = config.jnxStoreKeys.specialOpsColumnsFilters;
		var findTimeEntries;
		$scope.driversAndOps = driversAndOps;
		//$scope.periodFilterKey = undefined;
		$scope.periodFilterKey = (storedFilterPeriod) ? storedFilterPeriod : 'last7Days';
		$scope.periodFilterOptions = config.periodFilterSpecialOps;
		$scope.lang = $translate.use();

		var dateTimeFormatString = agGridComp.dateTimeCellEditor.formatString;

		$scope.export = function () {
			var ids = [];
			$scope.gridOptions.api.forEachNodeAfterFilter(function (item) {
				ids.push(item.data.id);
			});

			timeEntryService.timeEntryReportSpecialOps(ids);
		};

		$scope.periodChange = function () {
			console.log('All options ' + JSON.stringify($scope.periodFilterOptions));
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
				field       : 'code',
				editable    : true,
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
				var filterModel = jnxStorage.findItem(columnsFiltersKey, true);
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

				// var endToUpdate;
				//
				// if (rowObj.data.end) {
				// 	endToUpdate = moment(rowObj.data.end).toDate();
				// }
				//
				// var resource = _.clone(rowObj.data.staff);
				// // TODO: Temporary solution, remove once we obtain the list of operations and staff separately
				// delete resource.opId;
				//
				// var specialOpsTimeEntryToUpdate = {
				// 	'id'         : rowObj.data.id,
				// 	'resources'  : [_.clone(resource)],
				// 	'principals' : [],
				// 	'attributes' : [],
				// 	'type'       : 'SPECIAL_OPS',
				// 	'comment'    : rowObj.data.comment,
				// 	'begin'      : moment(rowObj.data.begin).toDate(),
				// 	'end'        : endToUpdate,
				// 	'billable'   : true,
				// 	'idOperation': rowObj.data.operation.id
				// };
				//
				// specialOpsTimeEntryToUpdate.resources[0].type = rowObj.data.functionValue;
				// specialOpsTimeEntryToUpdate.resources[0] = operationUtilService.setExtraFlag(specialOpsTimeEntryToUpdate.resources[0]);
				var specialOpsTimeEntryToUpdate = operationUtilService.createSpecialOpsTimeEntryForUpdate(rowObj);

				if (!_.isNil(specialOpsTimeEntryToUpdate)) {
					timeEntryService.update(specialOpsTimeEntryToUpdate).then(function () {
					}).finally(function () {
						findTimeEntries($scope.periodFilterKey);
					});
				} else {
					findTimeEntries($scope.periodFilterKey);
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
				jnxStorage.setItem(columnsFiltersKey, savedFilters, true);
				// console.log('savedFilters' + JSON.stringify(savedFilters));
			}
		};

		findTimeEntries = function (periodKey) {
			console.log('Selected period key: ' + periodKey);
			var period = timePeriods.specialOps[periodKey];
			operationService.findWithTimeEntriesByDateBetweenAndTypeByAuthenticatedUser(period.from(), period.to(), 'SPECIAL_OPS')
				.then(function (result) {
					// console.log(JSON.stringify(result));
					var agGridRecords = operationService.mapTimeEntryData(result);

					//Now put the ag-grid ready records to the ui.
					$scope.gridOptions.api.setRowData(agGridRecords);
				});

		};
		$scope.findTimeEntries = findTimeEntries;

		$scope.$on('sideMenuSizeChange', function () {
			agGridSizeToFit();
		});

		// We need to reload because when the language changes ag-grid doesn't reload by itself
		$rootScope.$on('$translateChangeSuccess', function () {
			console.log('$translateChangeSuccess');
			$state.reload();
		});


	}];
