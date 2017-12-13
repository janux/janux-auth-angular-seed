'use strict';

var angular = require('angular');
var moment = require('moment');
var _ = require('lodash');
// var records = require('./mock-data');
var agGridComp = require('common/ag-grid-components');

module.exports = ['$scope', 'operationService', 'resourceService','$q','$timeout','$modal','$interval','driversAndOps','timeEntryService',
	function ($scope, operationService, resourceService, $q, $timeout, $modal, $interval, driversAndOps, timeEntryService) {

	$scope.driversAndOps = driversAndOps;

	var dateTimeFormatString = agGridComp.dateTimeCellEditor.formatString;
	var allDrivers = driversAndOps.drivers;
	var driversAssignedToOperations = driversAndOps.driversAssignedToOperations;
	var operations = driversAndOps.operations;

	var initRowModel = function () {
		$scope.lbRow = {
			staff: '',
			operation: '',
			start: moment().format(dateTimeFormatString),
			end: undefined,
			provider: '',
			location: '',
			absence: ''
		};
	};
	initRowModel();

	var refreshStartServiceTime = 60*1000;	// 1 minute
	// Refresh start time
	$interval(function () {
		$scope.lbRow.start = moment().format(dateTimeFormatString);
	},refreshStartServiceTime);

	// Models used when entering the search query for the autocomplete fields
	$scope.lbSearch = {
		staff: '',
		operation: '',
		provider: ''
	};

	var infoDialog = function(message){
		$modal.open({
			templateUrl: 'app/dialog-tpl/info-dialog.html',
			controller: ['$scope','$modalInstance',
				function($scope , $modalInstance) {
					$scope.message= message;

					$scope.ok = function() {
						$modalInstance.close();
					};
				}],
			size: 'md'
		});
	};

	// Runs every time the text in the field to find the staff member changes
	// $scope.staffSearchTextChange = function(text) {
	// 	console.info('Text changed to ' + text);
	// };

	//
	// Staff autocomplete
	//
	$scope.staffSelectedItemChange = function(item) {
		if(typeof item !== 'undefined') {
			// This item should contain the selected staff member
			console.info('Item changed to ' + JSON.stringify(item));

			var selectedDriver = _.find(driversAssignedToOperations,function (o) {
				return o.id === item.id;
			});

			var operationId = selectedDriver.opId;

			var staffOperations = _.filter(operations, {id:operationId});
			console.log('Selected staff operations', staffOperations);
			$scope.lbRow.operation = staffOperations[0];

		} else {
			// This means that the entered search text is empty or doesn't match any staff member
		}
	};

	function createFilterForStaff(query) {
		return function filterFn(operationDriver) {
			var driver = operationDriver.resource;
			var name = driver.name.last+' '+driver.name.first;
			var index = name.toLowerCase().indexOf(angular.lowercase(query));
			return (index === 0);
		};
	}

	$scope.staffSearch = function(query) {
		return query ? allDrivers.filter( createFilterForStaff(query) ) : allDrivers;
	};

	//
	// Operation autocomplete
	//
	$scope.opsSelectedItemChange = function(item) {
		if(typeof item !== 'undefined') {
			// This item should contain the selected operation
			// console.info('Item changed to ' + JSON.stringify(item));
		} else {
			// This means that the entered search text is empty or doesn't match any operation
		}
	};

	function createFilterForOps(query) {
		return function filterFn(operation) {
			var index = operation.name.toLowerCase().indexOf(angular.lowercase(query));
			return (index === 0);
		};
	}

	$scope.opsSearch = function(query) {
		return query ? operations.filter( createFilterForOps(query) ) : operations;
	};


	$scope.export = function () {
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
			fileName: 'export.csv',
			columnSeparator: ',',
			processCellCallback : function(params) {
				if (params.value ) {
					if(params.column.colId === 'staff') {
						return '"' + params.value.resource.displayName + '"';
					} else if(params.column.colId === 'operation' ){
						return '"' + params.value.name + '"';
					} else  {
						return '"' +  params.value + '"';
					}
				} else {
					return params.value;
				}
			}
		};

		$scope.gridOptions.api.exportDataAsCsv(params);
	};

	// Add new record
	$scope.addRow = function () {
		// Selected person
		if(!!$scope.lbRow.staff){
			if(!!$scope.lbRow.operation){
				if(!!$scope.driverTimeSheet.$valid){
					var begin = moment($scope.lbRow.start);
					var end = '', endToInsert;

					if(_.isNil($scope.lbRow.end) === false) {
						end = moment($scope.lbRow.end);
						endToInsert = end.toDate();

						if(begin > end) {
							infoDialog('End date should be higher than begin date');
							return;
						}
					}

					var timeEntryToInsert = {
						'resources': [ $scope.lbRow.staff ],
						'principals': [],
						'attributes': [],
						'type': 'DRIVER',
						'comment': $scope.lbRow.location,
						'begin': begin.toDate(),
						'end': endToInsert,
						'billable': true,
						'idOperation': $scope.lbRow.operation.id
					};

					// Absence
					timeEntryToInsert.resources[0].absence = $scope.lbRow.absence;

					timeEntryService.insert(timeEntryToInsert).then(function(){
						$scope.init();

						// Wait before performing the form reset
						$timeout(function(){
							initRowModel();
							$scope.driverTimeSheet.$setUntouched(true);
							$scope.driverTimeSheet.$setPristine(true);
							// Go to last page
							// $scope.gridOptions.api.paginationGoToLastPage();
						},10);
					});
				}
			} else {
				infoDialog('Invalid operation selected');
			}
		} else {
			infoDialog('Invalid staff member selected');
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
		if(selectedData.length > 0) {
			$modal.open({
				templateUrl: 'app/dialog-tpl/confirm-dialog.html',
				controller: ['$scope','$modalInstance',
					function($scope , $modalInstance) {
						$scope.message= 'Are you sure you want to delete the row selection?';

						$scope.ok = function() {
							deleteConfirmed(selectedData );
							$modalInstance.close();
						};

						$scope.cancel = function() {
							$modalInstance.close();
						};
					}],
				size: 'md'
			});
		}else{
			infoDialog('Select at least one row to delete');
		}
	};

	//
	// AG-Grid
	//
	var columnDefs = [
		{
			headerName: 'Personal',
			field: 'staff',
			editable: true,
			// cellRenderer: agGridComp.staffCellRenderer,
			valueGetter: function(params) {
				var res = params.data.staff.resource;
				return res.name.last +' '+ res.name.first;
			},
			cellEditor: agGridComp.autocompleteStaffCellEditor
		},
		{
			headerName: 'Servicio',
			field: 'operation',
			editable: true,
			// cellRenderer: agGridComp.operationCellRenderer,
			valueGetter: function(params) {
				return params.data.operation.name;
			},
			cellEditor: agGridComp.autocompleteOpCellEditor
		},
		{
			headerName: 'Cliente',
			field: 'client',
			editable: true,
			cellEditor: agGridComp.clientCellUpdater
		},
		{
			headerName: 'Inicio',
			field: 'begin',
			editable: true,
			filter: 'date',
			cellEditor: agGridComp.dateTimeCellEditor,
			sort: 'desc'
		},
		{
			headerName: 'Termino',
			field: 'end',
			editable: true,
			filter: 'date',
			cellEditor: agGridComp.dateTimeCellEditor
		},
		{
			headerName: 'Duración',
			field: 'duration',
			editable: true,
			cellEditor: agGridComp.durationCellUpdater
		},
		{
			headerName: 'Ubicación',
			field: 'comment',
			editable: true,
			cellEditor: agGridComp.commentCellEditor
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
			headerName: 'Falta',
			field: 'absence',
			editable: true,
			cellEditor: agGridComp.absenceCellEditor,
			valueFormatter: function (params) {
				var val = '';
				switch(params.value){
					case 'D': val='Descanso'; break;
					case 'V': val='Vacaciones'; break;
					case 'PS': val='No se encuentra principal'; break;
					case 'F': val='Falta'; break;
					case 'PC': val='PC'; break;
					case 'I': val='I'; break;
				}
				return val;
			}
		},
		{
			headerName: '',
			// headerCheckboxSelection: true,
			// headerCheckboxSelectionFilteredOnly: true,
			checkboxSelection: true,
			cellEditor: agGridComp.rowActions,
			headerComponent: agGridComp.deleteRowsHeaderComponent,
			editable: true,
			field: 'selected'	// field needed to avoid ag-grid warning
		}
	];

	$scope.gridOptions = {
		columnDefs: columnDefs,
		rowData: [],
		enableFilter: true,
		editType: 'fullRow',
		angularCompileRows: true,
		enableColResize: true,
		suppressRowClickSelection: true,
		rowSelection: 'multiple',
		animateRows: true,
		rowHeight: 50,
		headerHeight: 35,
		enableSorting: true,
		pagination:true,
		paginationAutoPageSize:true,
		onGridReady: function () {
			$scope.gridOptions.api.sizeColumnsToFit();

			// This function is defined to be able to trigger the deletion
			// of the rows from the header component that does not have access
			// to the scope.
			$scope.gridOptions.api.deleteRows = removeSelected;
		},
		onRowEditingStarted: function (rowObj) {
			// Nothing to do yet
			console.log('Row edition started', rowObj);
		},
		onRowValueChanged: function (rowObj) {
			console.log('Row data changed', rowObj);

			var endToUpdate;

			if(rowObj.data.end) {
				endToUpdate = moment(rowObj.data.end).toDate();
			}

			var resource = _.clone(rowObj.data.staff);
			// TODO: Temporary solution, remove once we obtain the list of operations and staff separately
			delete resource.opId;

			var timeEntryToUpdate = {
				'id': rowObj.data.id,
				'resources': [ resource ],
				'principals': [],
				'attributes': [],
				'type': 'DRIVER',
				'comment': rowObj.data.comment,
				'begin': moment(rowObj.data.begin).toDate(),
				'end': endToUpdate,
				'billable': true,
				'idOperation': rowObj.data.operation.id
			};

			timeEntryToUpdate.resources[0].absence = rowObj.data.absence;

			timeEntryService.update(timeEntryToUpdate).then(function(){
				$scope.init();
				// infoDialog('Time entry successfully updated');
			});
		}
		// components:{
		// 	dateComponent: agGridComp.dateFilter
		// }
	};

	$scope.init = function () {
		operationService.findAll()
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

	$scope.init();
	//
	// End of AG-Grid
	//
}];