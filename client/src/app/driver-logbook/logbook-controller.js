'use strict';

var angular = require('angular');
var moment = require('moment');
var records = require('./mock-data');
var agGridComp = require('common/ag-grid-components');

module.exports = ['$scope', 'operationService','$q','$timeout', function ($scope, operationService, $q, $timeout) {


	var dateTimeFormatString = agGridComp.dateTimeCellEditor.formatString;

	// Mock persons
	var persons = records.persons;

	// Models used when entering the search query for the autocomplete fields
	$scope.lbSearch = {
		person: ''
	};

	// Runs every time the text in the field to find the staff member changes
	// $scope.personSearchTextChange = function(text) {
	// 	console.info('Text changed to ' + text);
	// };

	// Run only when a valid person is selected or the field ends empty
	$scope.personSelectedItemChange = function(item) {
		if(typeof item !== 'undefined') {
			// This item should contain the selected person
			console.info('Item changed to ' + JSON.stringify(item));
			// TODO: assign the selected person
		} else {
			// This means that the entered search text is empty or doesn't match any staff member
		}
	};

	function createFilterFor(query) {
		return function filterFn(person) {
			var index = person.displayName.toLowerCase().indexOf(angular.lowercase(query));
			return (index === 0);
		};
	}

	$scope.personSearch = function(query) {
		var results = query ? persons.filter( createFilterFor(query) ) : persons;
		var deferred;
		deferred = $q.defer();
		// Simulate server delay
		$timeout(function () { deferred.resolve( results ); }, Math.random() * 1000, false);
		return deferred.promise;
	};

	$scope.lbRow = {
		person: '',
		service: '',
		start: '',
		end: '',
		provider: '',
		location: '',
		absence: ''
	};

	$scope.date = new Date();

	// Add new record
	$scope.addRow = function () {
		var start = moment($scope.lbRow.start);
		var end = moment($scope.lbRow.end);
		var duration = end.diff(start, 'hours') + ' hrs.';

		$scope.gridOptions.api.updateRowData({
			add: [{
				person: $scope.lbRow.person.displayName,
				client: '',
				name: $scope.lbRow.service,
				begin: start.format(dateTimeFormatString),
				end: end.format(dateTimeFormatString),
				duration: duration,
				comment: $scope.lbRow.location,
				absence: $scope.lbRow.absence
			}]
		});
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
		{headerName: 'Personal', field: 'person', editable: false},
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
			editable: false,
			field: 'Selected'	// field needed to avoid ag-grid warning
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
		onGridReady: function () {
			$scope.gridOptions.api.sizeColumnsToFit();
		},
		onRowEditingStarted: function (rowObj) {
			// Nothing to do yet
			console.log('Row edition started', rowObj);
		},
		onRowValueChanged: function (rowObj) {
			console.log('Row data changed', rowObj);
		}
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