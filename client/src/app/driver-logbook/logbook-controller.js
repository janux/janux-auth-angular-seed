'use strict';

var angular = require('angular');
var moment = require('moment');
var _ = require('lodash');
var records = require('./mock-data');
var agGridComp = require('common/ag-grid-components');

module.exports = ['$scope', 'operationService','$q','$timeout','$modal','$interval',
	function ($scope, operationService, $q, $timeout, $modal, $interval) {

	var dateTimeFormatString = agGridComp.dateTimeCellEditor.formatString;

	// Mock staff
	var staff = records.staff;
	// Mock operations
	var operations = records.operations;
	// Mock clients
	var clients = records.clients;
	// // Mock providers
	// var providers = records.providers;

	var initRowModel = function () {
		$scope.lbRow = {
			staff: '',
			operation: '',
			start: moment().format(dateTimeFormatString),
			end: '',
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
			// TODO: assign the selected person
		} else {
			// This means that the entered search text is empty or doesn't match any staff member
		}
	};

	function createFilterForStaff(query) {
		return function filterFn(staff) {
			var name = staff.name.last+' '+staff.name.first;
			var index = name.toLowerCase().indexOf(angular.lowercase(query));
			return (index === 0);
		};
	}

	$scope.staffSearch = function(query) {
		var results = query ? staff.filter( createFilterForStaff(query) ) : staff;
		// var deferred = $q.defer();
		// Simulate server delay
		// $timeout(function () { deferred.resolve( results ); }, Math.random() * 1000, false);
		// return deferred.promise;
		return results;
	};

	//
	// Operation autocomplete
	//
	$scope.opsSelectedItemChange = function(item) {
		if(typeof item !== 'undefined') {
			// This item should contain the selected operation
			console.info('Item changed to ' + JSON.stringify(item));
			// TODO: assign the selected person
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
		var results = query ? operations.filter( createFilterForOps(query) ) : operations;
		var deferred;
		deferred = $q.defer();
		// Simulate server delay
		$timeout(function () { deferred.resolve( results ); }, Math.random() * 1000, false);
		return deferred.promise;
	};

	//
	// Provider autocomplete
	//
	// $scope.providerSelectedItemChange = function(item) {
	// 	if(typeof item !== 'undefined') {
	// 		// This item should contain the selected provider
	// 		console.info('Item changed to ' + JSON.stringify(item));
	// 		// TODO: assign the selected person
	// 	} else {
	// 		// This means that the entered search text is empty or doesn't match any provider
	// 	}
	// };
	//
	// function createFilterForProvider(query) {
	// 	return function filterFn(provider) {
	// 		var index = provider.name.toLowerCase().indexOf(angular.lowercase(query));
	// 		return (index === 0);
	// 	};
	// }
	//
	// $scope.providerSearch = function(query) {
	// 	var results = query ? providers.filter( createFilterForProvider(query) ) : providers;
	// 	var deferred;
	// 	deferred = $q.defer();
	// 	// Simulate server delay
	// 	$timeout(function () { deferred.resolve( results ); }, Math.random() * 1000, false);
	// 	return deferred.promise;
	// };

	// Add new record
	$scope.addRow = function () {
		// Selected person
		if(!!$scope.lbRow.staff){
			if(!!$scope.lbRow.operation){
				if(!!$scope.driverTimeSheet.$valid){
					var start = moment($scope.lbRow.start).format(dateTimeFormatString);
					var end = '';
					var duration = '';

					if($scope.lbRow.end !==''){
						end = moment($scope.lbRow.end);
						duration = end.diff(start, 'hours');
						end = end.format(dateTimeFormatString);
					}

					$scope.gridOptions.api.updateRowData({
						add: [{
							staff: $scope.lbRow.staff.displayName,
							client: _.find(clients, {id: $scope.lbRow.operation.idClient}).name,
							name: $scope.lbRow.operation.name,
							begin: start,
							end: end,
							duration: duration,
							comment: $scope.lbRow.location,
							absence: $scope.lbRow.absence
						}]
					});

					// Wait before performing the form reset
					$timeout(function(){
						initRowModel();
						$scope.driverTimeSheet.$setUntouched(true);
						$scope.driverTimeSheet.$setPristine(true);
						// Go to last page
						$scope.gridOptions.api.paginationGoToLastPage();
					},10);

				}
			} else {
				infoDialog('Invalid operation selected');
			}
		} else {
			infoDialog('Invalid staff member selected');
		}
	};

	// Remove selected records
	$scope.removeSelected = function () {
		var selectedData = $scope.gridOptions.api.getSelectedRows();
		$scope.gridOptions.api.updateRowData({remove: selectedData});
	};

	//
	// AG-Grid
	//

	var columnDefs = [
		{headerName: 'Personal', field: 'staff', editable: false},
		{headerName: 'Cliente', field: 'client', editable: false},
		{headerName: 'Servicio', field: 'name', editable: false},
		{
			headerName: 'Inicio',
			field: 'begin',
			editable: true,
			filter: 'date',
			cellEditor: agGridComp.dateTimeCellEditor
		},
		{
			headerName: 'Termino',
			field: 'end',
			editable: true,
			filter: 'date',
			cellEditor: agGridComp.dateTimeCellEditor
		},
		{headerName: 'Duración', field: 'duration', editable: false},
		{
			headerName: 'Ubicación',
			field: 'comment',
			editable: false,
			cellEditor: agGridComp.largeTextCellEditor
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
		{headerName: 'Falta', field: 'absence', editable: true},
		{
			headerName: '',
			headerCheckboxSelection: true,
			headerCheckboxSelectionFilteredOnly: true,
			checkboxSelection: true,
			headerComponentParams: {menuIcon: 'fa-external-link'},
			cellEditor: agGridComp.rowActions,
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
		enableSorting: true,
		pagination:true,
		paginationAutoPageSize:true,
		onGridReady: function () {
			$scope.gridOptions.api.sizeColumnsToFit();
		},
		onRowEditingStarted: function (rowObj) {
			// Nothing to do yet
			console.log('Row edition started', rowObj);
		},
		onRowValueChanged: function (rowObj) {
			console.log('Row data changed', rowObj);
		},
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
	};

	$scope.init();
	//
	// End of AG-Grid
	//
}];