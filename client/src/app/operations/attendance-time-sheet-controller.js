'use strict';

var moment = require('moment');
var _ = require('lodash');
var agGridComp = require('common/ag-grid-components');
var timePeriods = require('common/time-periods');

module.exports = ['$rootScope', '$scope', '$log', 'config', 'jnxStorage', 'operationService', 'resourceService', '$q', '$timeout', '$modal', '$interval', 'driversAndOps', 'timeEntries', 'timeEntryService', '$filter', '$state', '$translate',
	function ($rootScope, $scope, $log, config, jnxStorage, operationService, resourceService, $q, $timeout, $modal, $interval, driversAndOps, timeEntries, timeEntryService, $filter, $state, $translate) {

		var storedFilterPeriod = jnxStorage.findItem('attendanceTimeLogFilterPeriod', true);

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


		var initRowModel = function () {
			$scope.lbRow = {
				staff    : '',
				operation: '',
				start    : moment().startOf('day').format(dateTimeFormatString),
				end      : undefined,
				location : '',
				absence  : ''
			};
		};
		initRowModel();

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
			var period = timePeriods[periodKey];
			var promise;
			if (_.isNil(resource)) {
				$log.debug('Calling filter with no person');
				promise = operationService.findWithTimeEntriesByDateBetweenAndType(period.from(), period.to(), undefined);
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

			//Test resource service.
			// resourceService.findAvailableResources()
			// 	.then(function (result) {
			// 		console.log('Result resource service: \n ' + JSON.stringify(result));
			// 	});

		};


		$scope.staffInsertSelectedItemChange = function (item) {
			console.log('item   ' + JSON.stringify(item));
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
			return query ? allStaff.filter(createFilterForStaff(query)) : allStaff;
		};

		$scope.export = function () {

			var ids = [];

			$scope.gridOptions.api.forEachNodeAfterFilter(function (item) {
				ids.push(item.data.id);
			});

			timeEntryService.timeEntryReport(ids);

		};

		function handleAbsence(timeEntry, absence) {
			timeEntry.billable = false;
			timeEntry.resources[0].absence = absence;
			return timeEntry;
		}


		// Add new record
		$scope.addRow = function () {
			// Selected person
			if (!!$scope.lbRow.staff) {
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

					var attendanceTimeEntryToInsert = {
						'resources'  : [_.clone($scope.lbRow.staff)],
						'principals' : [],
						'attributes' : [],
						'type'       : 'ATTENDANCE',
						'comment'    : $scope.lbRow.location,
						'begin'      : begin.toDate(),
						'end'        : endToInsert,
						'billable'   : true,
						'idOperation': $scope.operation.id
					};


					attendanceTimeEntryToInsert = handleAbsence(attendanceTimeEntryToInsert, $scope.lbRow.absence);

					timeEntryService.insert(attendanceTimeEntryToInsert).then(function () {
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

			//TODO: Validate only attendance rows.

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
				headerName : $filter('translate')('operations.attendanceTimeLog.staff'),
				field      : 'staff',
				editable   : true,
				// cellRenderer: agGridComp.staffCellRenderer,
				valueGetter: function (params) {
					var result;
					if (_.isNil(params.data.staff)) {
						result = '';
					} else {
						result = params.data.staff.resource;
						result = result.name.last + ' ' + result.name.first;
					}
					return result;
				},
				cellEditor : agGridComp.autocompleteStaffCellEditor
			},
			{
				headerName : $filter('translate')('operations.attendanceTimeLog.operation'),
				field      : 'operation',
				editable   : true,
				valueGetter: function (params) {
					return params.data.operation.name;
				},
				cellEditor : agGridComp.autocompleteOpCellEditor,
				width      : 110
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
				editable      : true,
				filter        : 'date',
				filterParams  : {
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
				editable      : true,
				filter        : 'date',
				filterParams  : {
					comparator: agGridComp.dateFilterComparator
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
				editable  : true,
				cellEditor: agGridComp.durationCellUpdater,
				width     : 95
			},
			{
				headerName   : $filter('translate')('operations.attendanceTimeLog.comment'),
				field        : 'comment',
				editable     : true,
				cellEditor   : agGridComp.commentCellEditor,
				cellStyle    : {
					'white-space': 'normal'
				},
				cellFormatter: function (params) {
					var maxLength = 35;
					var comment = params.data.comment;
					return agGridComp.util.truncate(comment, maxLength, '...');
				}
			},
			{
				headerName    : $filter('translate')('operations.attendanceTimeLog.absence'),
				field         : 'absence',
				editable      : true,
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
				editable       : true,
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
			},
			onRowEditingStarted      : function () {
				// Nothing to do yet
				// console.log('Row edition started', rowObj);
			},
			onRowValueChanged        : function (rowObj) {
				// console.log('Row data changed', rowObj);

				var operation = rowObj.data.operation;
				if (operation.type === 'ATTENDANCE') {
					var endToUpdate;

					if (rowObj.data.end) {
						endToUpdate = moment(rowObj.data.end).toDate();
					}

					var resource = _.clone(rowObj.data.staff);
					delete resource.opId;

					var timeEntryToUpdate = {
						'id'         : rowObj.data.id,
						'resources'  : [_.clone(resource)],
						'principals' : [],
						'attributes' : [],
						'type'       : 'ATTENDANCE',
						'comment'    : rowObj.data.comment,
						'begin'      : moment(rowObj.data.begin).toDate(),
						'end'        : endToUpdate,
						'billable'   : true,
						'idOperation': rowObj.data.operation.id
					};

					// Force the resource for the time entry is of type "DRIVER". In case of the user use a different type.
					timeEntryToUpdate = handleAbsence(timeEntryToUpdate, rowObj.data.absence);


					timeEntryService.update(timeEntryToUpdate).then(function () {
						$scope.findTimeEntries($scope.periodFilterKey);
						// infoDialog('Time entry successfully updated');
					});
				} else {
					infoDialog('operations.dialogs.invalidOperationForAttendance');
					$scope.findTimeEntries($scope.periodFilterKey);
				}


			},

			localeTextFunc: function (key, defaultValue) {
				var gridKey = 'grid.' + key;
				var value = $filter('translate')(gridKey);
				return value === gridKey ? defaultValue : value;
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
	}];