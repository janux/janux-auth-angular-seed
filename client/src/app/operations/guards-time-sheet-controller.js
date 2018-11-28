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
		$scope.periodFilterOptions = config.periodFilter;
		$scope.lang = $translate.use();

		$scope.periodChange = function () {
			jnxStorage.setItem('guardsTimeLogFilterPeriod', $scope.periodFilterKey, true);
			$scope.findTimeEntries($scope.periodFilterKey);
		};

		var dateTimeFormatString = agGridComp.dateTimeCellEditor.formatString;
		// var allGuards = driversAndOps.allPersonnelAvailableForSelection;
		// var guardsAssignedToOperations = driversAndOps.guardsAssignedToOperations;
		// var operations = driversAndOps.operations;

		// var initRowModel = function () {
		// 	$scope.lbRow = {
		// 		staff     : '',
		// 		operation : '',
		// 		start     : moment().startOf('day').format(dateTimeFormatString),
		// 		end       : undefined,
		// 		provider  : '',
		// 		location  : '',
		// 		isExternal: false
		// 	};
		// };
		// initRowModel();
		// Models used when entering the search query for the autocomplete fields
		// $scope.lbSearch = {
		// 	staff    : '',
		// 	operation: '',
		// 	provider : ''
		// };


		// Set isBillableFlag given the user input.
		// function setBillableFlag(timeEntry) {
		// 	if (timeEntry.extras === 'A' || timeEntry.extras === 'CLOSED' || timeEntry.extras === 'NOT COVERED') {
		// 		timeEntry.billable = false;
		// 	}
		// 	return timeEntry;
		// }

		// Replacing base por empty string.
		// "BASE" is a temporal string that help to filter data in the ag-grid.
		// function setExtraFlag(timeEntry) {
		// 	if (timeEntry.extras === 'BASE') {
		// 		timeEntry.extras = '';
		// 	}
		// 	return timeEntry;
		// }

		// function setExternalFlag(timeEntry, isExternal) {
		// 	if (timeEntry.resources.length > 0) {
		// 		if (isExternal === true) {
		// 			timeEntry.resources[0].isExternal = true;
		// 			// TODO: Replace this hardcoded id.
		// 			timeEntry.resources[0].vendor.id = config.glarus;
		// 		} else {
		// 			timeEntry.resources[0].isExternal = false;
		// 		}
		// 	}
		//
		// 	return timeEntry;
		// }

		// Fix resource type given the user input.
		// function setResourceType(timeEntry) {
		//
		// 	// If night shift maintenance. Whe change the resource type.
		// 	if (timeEntry.extras === 'NM') {
		// 		timeEntry.resources[0].type = 'GUARD_NIGHT_SHIFT_MAINTENANCE';
		// 	} else if (timeEntry.extras === 'NRM') {
		// 		//If goods receipt. We change the resource type.
		// 		timeEntry.resources[0].type = 'GUARD_GOODS_RECEIPT';
		// 	} else if (timeEntry.extras === 'AF' || timeEntry.extras === 'A') {
		// 		//If guard support. We change the resource type.
		// 		timeEntry.resources[0].type = 'GUARD_SUPPORT';
		// 	} else if (timeEntry.extras === 'CLOSED') {
		// 		// If the store is closed. We remove the assigned resource/
		// 		timeEntry.resources = [];
		// 	} else if (timeEntry.extras === 'NOT COVERED') {
		// 		// If the record is "Not covered". We remove the assigned resource.
		// 		timeEntry.resources = [];
		// 	} else if (timeEntry.extras === 'GUARD_SHIFT_MANAGER') {
		// 		timeEntry.resources[0].type = 'GUARD_SHIFT_MANAGER';
		// 	} else {
		// 		// Default : Guard.
		// 		timeEntry.resources[0].type = 'GUARD';
		// 	}
		// 	return timeEntry;
		// }

		// Fill the initial hour and end hour to the time entry
		// attributes given the extra value and the operation defined
		// function setHoursInResource(operation, timeEntry) {
		// 	var initHourParameter;
		// 	var endHourHourParameter;
		// 	var initHourAttributeValuePair;
		// 	var endHourAttributeValuePair;
		// 	var timeEntryInitHourParameterName = 'init.hour';
		// 	var timeEntryEndHourParameterName = 'end.hour';
		// 	var existingAttributeValuePair;
		// 	switch (timeEntry.extras) {
		// 		case 'NM':
		// 			initHourParameter = 'nightShiftMaintenance.initHour';
		// 			endHourHourParameter = 'nightShiftMaintenance.endHour';
		// 			break;
		// 		case 'NRM':
		// 			initHourParameter = 'goodsReceipt.initHour';
		// 			endHourHourParameter = 'goodsReceipt.endHour';
		// 			break;
		// 		case 'A':
		// 			initHourParameter = 'guardSupport.initHour';
		// 			endHourHourParameter = 'guardSupport.endHour';
		// 			break;
		// 		case 'AF':
		// 			initHourParameter = 'guardSupport.initHour';
		// 			endHourHourParameter = 'guardSupport.endHour';
		// 			break;
		// 		case 'GUARD_SHIFT_MANAGER':
		// 			initHourParameter = 'shiftManager.initHour';
		// 			endHourHourParameter = 'shiftManager.endHour';
		// 			break;
		// 		default:
		// 			initHourParameter = 'guard.initHour';
		// 			endHourHourParameter = 'guard.endHour';
		// 			break;
		// 	}
		// 	if (!_.isNil(initHourParameter) && !_.isNil(endHourHourParameter)) {
		// 		initHourAttributeValuePair = _.find(operation.attributes, function (o) {
		// 			return o.name === initHourParameter;
		// 		});
		// 		endHourAttributeValuePair = _.find(operation.attributes, function (o) {
		// 			return o.name === endHourHourParameter;
		// 		});
		//
		//
		// 		//Fill time entry attributes.
		// 		if (!_.isNil(initHourAttributeValuePair)) {
		// 			existingAttributeValuePair = _.find(timeEntry.attributes, function (o) {
		// 				return o.name === timeEntryInitHourParameterName;
		// 			});
		//
		// 			if (existingAttributeValuePair) {
		// 				existingAttributeValuePair.value = initHourAttributeValuePair.value;
		// 			} else {
		// 				timeEntry.attributes.push({
		// 					name : timeEntryInitHourParameterName,
		// 					value: initHourAttributeValuePair.value
		// 				});
		// 			}
		// 		}
		//
		// 		if (!_.isNil(endHourAttributeValuePair)) {
		// 			existingAttributeValuePair = _.find(timeEntry.attributes, function (o) {
		// 				return o.name === timeEntryEndHourParameterName;
		// 			});
		// 			if (existingAttributeValuePair) {
		// 				existingAttributeValuePair.value = endHourAttributeValuePair.value;
		// 			} else {
		// 				timeEntry.attributes.push({
		// 					name : timeEntryEndHourParameterName,
		// 					value: endHourAttributeValuePair.value
		// 				});
		// 			}
		// 		}
		// 	}
		// 	return timeEntry;
		// }

		//
		// Staff autocomplete
		//
		// $scope.staffSelectedItemChange = function (item) {
		// 	if (typeof item !== 'undefined') {
		// 		// This item should contain the selected staff member
		// 		console.info('Item changed to ' + JSON.stringify(item));
		//
		// 		$scope.lbRow.isExternal = item.resource.staff && item.resource.staff.isExternal === true;
		//
		// 		var selectedDriver = _.find(guardsAssignedToOperations, function (o) {
		// 			return o.resource.id === item.resource.id;
		// 		});
		//
		// 		if (_.isNil(selectedDriver)) {
		// 			$scope.lbRow.operation = undefined;
		// 		} else {
		// 			var operationId = selectedDriver.opId;
		// 			var staffOperations = _.filter(operations, {id: operationId});
		//
		// 			// console.log('Selected staff operations', staffOperations);
		// 			$scope.lbRow.operation = staffOperations[0];
		//
		// 		}
		// 	} else {
		// 		// This means that the entered search text is empty or doesn't match any staff member
		// 	}
		// };


		// $scope.staffSearch = function (query) {
		// 	return query ? allGuards.filter(nameQueryService.createFilterForStaff(query)) : allGuards;
		// };

		//
		// Operation autocomplete
		//
		// $scope.opsSelectedItemChange = function (item) {
		// 	if (typeof item !== 'undefined') {
		// 		// This item should contain the selected operation
		// 		// console.info('Item changed to ' + JSON.stringify(item));
		// 	} else {
		// 		// This means that the entered search text is empty or doesn't match any operation
		// 	}
		// };

		// function createFilterForOps(query) {
		// 	return function filterFn(operation) {
		// 		var contains = operation.name.toLowerCase().includes(query.toLowerCase());
		// 		return contains;
		// 	};
		// }
		//
		// $scope.opsSearch = function (query) {
		// 	return query ? operations.filter(createFilterForOps(query)) : operations;
		// };


		$scope.export = function () {
			var ids = [];
			$scope.gridOptions.api.forEachNodeAfterFilter(function (item) {
				ids.push(item.data.id);
			});
			timeEntryService.timeEntryReportGuard(ids);
		};

		// // Add new record
		// $scope.addRow = function () {
		// 	// Selected person
		// 	if ($scope.lbRow.extras === 'CLOSED' || $scope.lbRow.extras === 'NOT COVERED' || !!$scope.lbRow.staff) {
		// 		if (!!$scope.lbRow.operation) {
		// 			if (!!$scope.driverTimeSheet.$valid) {
		// 				var begin = moment($scope.lbRow.start);
		// 				var end = '', endToInsert;
		//
		// 				if (_.isNil($scope.lbRow.end) === false) {
		// 					end = moment($scope.lbRow.end);
		// 					endToInsert = end.toDate();
		//
		// 					if (begin > end) {
		// 						dialogService.info('operations.dialogs.endDateError');
		// 						return;
		// 					}
		// 				}
		//
		// 				var timeEntryToInsert = {
		// 					'resources'  : [_.clone($scope.lbRow.staff)],
		// 					'principals' : [],
		// 					'attributes' : [],
		// 					'type'       : 'GUARD',
		// 					'comment'    : $scope.lbRow.location,
		// 					'begin'      : begin.toDate(),
		// 					'end'        : endToInsert,
		// 					'billable'   : true,
		// 					'idOperation': $scope.lbRow.operation.id,
		// 					'extras'     : $scope.lbRow.extras
		// 				};
		//
		// 				timeEntryToInsert = setResourceType(timeEntryToInsert);
		// 				timeEntryToInsert = setBillableFlag(timeEntryToInsert);
		// 				timeEntryToInsert = setHoursInResource($scope.lbRow.operation, timeEntryToInsert);
		// 				timeEntryToInsert = setExternalFlag(timeEntryToInsert, $scope.lbRow.isExternal);
		//
		// 				timeEntryService.insert(timeEntryToInsert).then(function () {
		// 					$scope.findTimeEntries($scope.periodFilterKey);
		//
		// 					// Wait before performing the form reset
		// 					$timeout(function () {
		// 						initRowModel();
		// 						$scope.driverTimeSheet.$setUntouched(true);
		// 						$scope.driverTimeSheet.$setPristine(true);
		// 						// Go to last page
		// 						// $scope.gridOptions.api.paginationGoToLastPage();
		// 					}, 10);
		// 				});
		// 			}
		// 		} else {
		// 			dialogService.info('operations.dialogs.invalidOperation');
		// 		}
		// 	} else {
		// 		dialogService.info('operations.dialogs.invalidStaff');
		// 	}
		// };


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
					if (_.isNil(params.data.code)) {
						result = params.data.client;
					} else {
						result = params.data.code;
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
				headerName    : $filter('translate')('operations.guardsTimeLog.begin'),
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
				headerName    : $filter('translate')('operations.guardsTimeLog.end'),
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
			onRowValueChanged        : function (rowObj) {

				console.log('Row data changed', rowObj);
				// $rootScope.$emit(config.timeEntry.guard.events.setUpdateMode, rowObj.data);
				// var endToUpdate;
				//
				// if (rowObj.data.end) {
				// 	endToUpdate = moment(rowObj.data.end).toDate();
				// }
				//
				// var resource = _.clone(rowObj.data.staff);
				// // TODO: Temporary solution, remove once we obtain the list of operations and staff separately
				// if (!_.isNil(resource)) {
				// 	delete resource.opId;
				// }
				//
				//
				// var timeEntryToUpdate = {
				// 	'id'         : rowObj.data.id,
				// 	'resources'  : _.isNil(resource) ? [] : [_.clone(resource)],
				// 	'principals' : [],
				// 	'attributes' : [],
				// 	'type'       : 'GUARD',
				// 	'comment'    : rowObj.data.comment,
				// 	'begin'      : moment(rowObj.data.begin).toDate(),
				// 	'end'        : endToUpdate,
				// 	'billable'   : true,
				// 	'idOperation': rowObj.data.operation.id,
				// 	'extras'     : rowObj.data.extras
				// };
				//
				//
				// timeEntryToUpdate = setExtraFlag(timeEntryToUpdate);
				// timeEntryToUpdate = setResourceType(timeEntryToUpdate);
				// timeEntryToUpdate = setBillableFlag(timeEntryToUpdate);
				// timeEntryToUpdate = setHoursInResource(rowObj.data.operation, timeEntryToUpdate);
				// timeEntryToUpdate = setExternalFlag(timeEntryToUpdate, rowObj.data.isExternal);
				//
				//
				// timeEntryService.update(timeEntryToUpdate).then(function () {
				// 	// $scope.findTimeEntries($scope.periodFilterKey);
				// 	// dialogService.info('Time entry successfully updated');
				// }).finally(function () {
				// 	$scope.findTimeEntries($scope.periodFilterKey);
				// });
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
