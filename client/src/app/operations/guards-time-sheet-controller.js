'use strict';

var moment = require('moment');
var _ = require('lodash');
var agGridComp = require('common/ag-grid-components');
var timePeriods = require('common/time-periods');

module.exports = ['$rootScope','$scope','config','jnxStorage','operationService', 'resourceService', '$q', '$timeout', '$modal', '$interval', 'driversAndOps', 'timeEntries', 'timeEntryService', '$filter','$state','$translate',
	function ($rootScope,$scope,config,jnxStorage,operationService, resourceService, $q, $timeout, $modal, $interval, driversAndOps, timeEntries, timeEntryService, $filter, $state, $translate) {

		var storedFilterPeriod = jnxStorage.findItem('driversTimeLogFilterPeriod', true);

		$scope.driversAndOps = driversAndOps;
		$scope.periodFilterKey = (storedFilterPeriod)?storedFilterPeriod:'last7Days';
		$scope.periodFilterOptions = config.periodFilter;
		$scope.lang = $translate.use();

		$scope.periodChange = function () {
			jnxStorage.setItem('driversTimeLogFilterPeriod',$scope.periodFilterKey,true);
			$scope.findTimeEntries($scope.periodFilterKey);
		};

		var dateTimeFormatString = agGridComp.dateTimeCellEditor.formatString;
		var allDrivers = driversAndOps.drivers;
		var driversAssignedToOperations = driversAndOps.driversAssignedToOperations;
		var operations = driversAndOps.operations;

		var initRowModel = function () {
			$scope.lbRow = {
				staff    : '',
				operation: '',
				start    : moment().startOf('day').format(dateTimeFormatString),
				end      : undefined,
				provider : '',
				location : '',
				absence  : ''
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

		// Runs every time the text in the field to find the staff member changes
		// $scope.staffSearchTextChange = function(text) {
		// 	console.info('Text changed to ' + text);
		// };

		//
		// Staff autocomplete
		//
		$scope.staffSelectedItemChange = function (item) {
			if (typeof item !== 'undefined') {
				// This item should contain the selected staff member
				console.info('Item changed to ' + JSON.stringify(item));

				var selectedDriver = _.find(driversAssignedToOperations, function (o) {
					return o.id === item.id;
				});

				if (_.isNil(selectedDriver)) {
					$scope.lbRow.operation = undefined;
				} else {
					var operationId = selectedDriver.opId;
					var staffOperations = _.filter(operations, {id: operationId});

					console.log('Selected staff operations', staffOperations);
					$scope.lbRow.operation = staffOperations[0];
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

			/*var now = moment();

			var params = {
				skipHeader: false,
				columnGroups: false,
				skipFooters: false,
				skipGroups: false,
				skipPinnedTop: true,
				skipPinnedBottom: true,
				allColumns: true,
				onlySelected: false,
				suppressQuotes: true,
				fileName: 'bitacora ' + now.format('YYYYMMDDHHmm') + ' .csv',
				columnSeparator: ',',
				processCellCallback : function(params) {
					if (params.value ) {
						if(params.column.colId === 'staff') {
							return '"' + params.value + '"';
						} else if(params.column.colId === 'operation' ){
							return '"' + params.value + '"';
						} else  {
							return '"' +  params.value + '"';
						}
					} else {
						return params.value;
					}
				}
			};

			$scope.gridOptions.api.exportDataAsCsv(params);*/


			var ids = [];

			$scope.gridOptions.api.forEachNodeAfterFilter(function (item) {
				ids.push(item.data.id);
			});

			timeEntryService.timeEntryReport(ids);

		};

		// Add new record
		$scope.addRow = function () {
			// Selected person
			if (!!$scope.lbRow.staff) {
				if (!!$scope.lbRow.operation) {
					if (!!$scope.driverTimeSheet.$valid) {
						var begin = moment($scope.lbRow.start);
						var end = '', endToInsert;

						if (_.isNil($scope.lbRow.end) === false) {
							end = moment($scope.lbRow.end);
							endToInsert = end.toDate();

							if (begin > end) {
								infoDialog('operations.dialogs.endDateError');
								return;
							}
						}

						var timeEntryToInsert = {
							'resources'  : [$scope.lbRow.staff],
							'principals' : [],
							'attributes' : [],
							'type'       : 'DRIVER',
							'comment'    : $scope.lbRow.location,
							'begin'      : begin.toDate(),
							'end'        : endToInsert,
							'billable'   : true,
							'idOperation': $scope.lbRow.operation.id
						};

						// Absence
						timeEntryToInsert.resources[0].absence = $scope.lbRow.absence;

						timeEntryService.insert(timeEntryToInsert).then(function () {
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
				} else {
					infoDialog('operations.dialogs.invalidOperation');
				}
			} else {
				infoDialog('operations.dialogs.invalidStaff');
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
							$scope.message= $filter('translate')('operations.dialogs.confirmDeletion');

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
				headerName : $filter('translate')('operations.driversTimeLog.staff'),
				field      : 'staff',
				editable   : true,
				// cellRenderer: agGridComp.staffCellRenderer,
				valueGetter: function (params) {
					var res = params.data.staff.resource;
					return res.name.last + ' ' + res.name.first;
				},
				cellEditor : agGridComp.autocompleteStaffCellEditor
			},
			{
				headerName : $filter('translate')('operations.driversTimeLog.operation'),
				field      : 'operation',
				editable   : true,
				// cellRenderer: agGridComp.operationCellRenderer,
				valueGetter: function (params) {
					return params.data.operation.name;
				},
				cellEditor : agGridComp.autocompleteOpCellEditor,
				width: 110
			},
			{
				headerName: $filter('translate')('operations.driversTimeLog.client'),
				field     : 'client',
				editable  : true,
				cellEditor: agGridComp.clientCellUpdater
			},
			{
				headerName : $filter('translate')('operations.driversTimeLog.begin'),
				field      : 'begin',
				editable   : true,
				filter     : 'date',
					filterParams:{
					inRangeInclusive : true,
					comparator: agGridComp.dateFilterComparator,
					filterOptions: ['equals', 'notEqual', 'lessThan', 'lessThanOrEqual', 'greaterThan', 'greaterThanOrEqual', 'inRange']
				},
				valueFormatter: function (params) {
					return (params.data.begin) ? moment(params.data.begin).format(dateTimeFormatString) : '';
				},
				cellEditor : agGridComp.dateTimeCellEditor,
				sort       : 'desc',
				width: 160
			},
			{
				headerName : $filter('translate')('operations.driversTimeLog.end'),
				field      : 'end',
				editable   : true,
				filter     : 'date',
				filterParams:{
					comparator: agGridComp.dateFilterComparator
				},
				valueFormatter: function (params) {
					return (params.data.end) ? moment(params.data.end).format(dateTimeFormatString) : '';
				},
				cellEditor : agGridComp.dateTimeCellEditor,
				width: 160
			},
			{
				headerName: $filter('translate')('operations.driversTimeLog.duration'),
				field     : 'duration',
				editable  : true,
				cellEditor: agGridComp.durationCellUpdater,
				width: 95
			},
			{
				headerName: $filter('translate')('operations.driversTimeLog.comment'),
				field     : 'comment',
				editable  : true,
				cellEditor: agGridComp.commentCellEditor,
				cellStyle: {
					'white-space': 'normal'
				},
				cellFormatter: function (params) {
					var maxLength = 35;
					var comment = params.data.comment;
					return agGridComp.util.truncate(comment,maxLength,'...');
				}
				// cellEditor: 'largeText',
				// cellEditorParams: {
				// 	maxLength: '300',
				// 	cols: '50',
				// 	rows: '6'
				// }
			},
			// {
			// 	headerName: 'Object',
			// 	field: 'Object',
			// 	editable: true,
			// 	cellRenderer:agGridComp.objectCellRenderer,
			// 	cellEditor: agGridComp.objectCellEditor
			// },
			{
				headerName    : $filter('translate')('operations.driversTimeLog.absence'),
				field         : 'absence',
				editable      : true,
				cellEditor    : agGridComp.absenceCellEditor,
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
						default:
							val = '';
							break;
					}
					return val;
				},
				filterParams: {
					textFormatter: function(value) {
						if(value === 'sin falta'){
							return 'SF';
						}else {
							return value;
						}
					}
				},
				width: 130
			},
			{
				headerName       : '',
				// headerCheckboxSelection: true,
				// headerCheckboxSelectionFilteredOnly: true,
				// checkboxSelection: true,
				cellRenderer	 : agGridComp.checkBoxRowSelection,
				cellEditor       : agGridComp.rowActions,
				headerComponent  : agGridComp.deleteRowsHeaderComponent,
				editable         : true,
				field            : 'selected',	// field needed to avoid ag-grid warning
				width: 80
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
			},
			onRowEditingStarted      : function (rowObj) {
				// Nothing to do yet
				console.log('Row edition started', rowObj);
			},
			onRowValueChanged        : function (rowObj) {
				console.log('Row data changed', rowObj);

				var endToUpdate;

				if (rowObj.data.end) {
					endToUpdate = moment(rowObj.data.end).toDate();
				}

				var resource = _.clone(rowObj.data.staff);
				// TODO: Temporary solution, remove once we obtain the list of operations and staff separately
				delete resource.opId;

				var timeEntryToUpdate = {
					'id'         : rowObj.data.id,
					'resources'  : [resource],
					'principals' : [],
					'attributes' : [],
					'type'       : 'DRIVER',
					'comment'    : rowObj.data.comment,
					'begin'      : moment(rowObj.data.begin).toDate(),
					'end'        : endToUpdate,
					'billable'   : true,
					'idOperation': rowObj.data.operation.id
				};

				// Temporary solution to mark records without absence
				var absence = (rowObj.data.absence!=='SF')?rowObj.data.absence:'';

				timeEntryToUpdate.resources[0].absence = absence;

				timeEntryService.update(timeEntryToUpdate).then(function () {
					$scope.findTimeEntries($scope.periodFilterKey);
					// infoDialog('Time entry successfully updated');
				});
			},
			localeTextFunc           : function (key, defaultValue) {
				var gridKey = 'grid.' + key;
				var value = $filter('translate')(gridKey);
				return value === gridKey ? defaultValue : value;
			}
			// components:{
			// 	dateComponent: agGridComp.dateFilter
			// }
		};

		$scope.findTimeEntries = function (periodKey) {
			var period = timePeriods[periodKey];

			operationService.findByDateBetweenWithTimeEntriesAndType(period.from(), period.to(),'GUARD')
				.then(function (result) {
					// console.log(JSON.stringify(result));
					var agGridRecords = operationService.mapTimeEntryData(result);

					//Now put the ag-grid ready records to the ui.
					$scope.gridOptions.api.setRowData(agGridRecords);
				});

			//Test resource service.
			// resourceService.findAvailableResources()
			// 	.then(function (result) {
			// 		console.log('Result resource service: \n ' + JSON.stringify(result));
			// 	});

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