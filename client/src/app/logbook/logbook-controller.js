'use strict';

var moment = require('moment');
var records = require('./mock-data');
var agGridComp = require('common/agGridComponents');

module.exports = ['$scope', function($scope) {

	$scope.lbRow = {
		personal: '',
		service: '',
		start: '',
		end: '',
		provider: '',
		location: '',
		absence: ''
	};

	$scope.date = new Date();

	// Add new record
	$scope.addRow = function() {
		console.log('$scope.lbRow', $scope.lbRow);
		var start = moment($scope.lbRow.start);
		var end = moment($scope.lbRow.end);
		var duration = end.diff(start, 'hours')+' hrs.';

		$scope.gridOptions.api.updateRowData({add:[{
			Personal: $scope.lbRow.personal,
			Service: $scope.lbRow.service,
			Start: start.format('DD/MM/YY hh:mm:ss a'),
			End: end.format('DD/MM/YY hh:mm:ss a'),
			Duration: duration,
			Provider: $scope.lbRow.provider,
			Location: $scope.lbRow.location,
			Absence: $scope.lbRow.absence
		}]});
	};

	// Remove selected records
	$scope.removeSelected = function() {
		var selectedData = $scope.gridOptions.api.getSelectedRows();
		$scope.gridOptions.api.updateRowData({remove: selectedData});
	};

	//
	// AG-Grid
	//

	var columnDefs = [
		{headerName: 'Personal', field: 'Personal', editable: true},
		{headerName: 'Servicio', field: 'Service', editable: true},
		{headerName: 'Inicio', field: 'Start', editable: true, filter:'date'},
		{headerName: 'Termino', field: 'End', editable: true, filter:'date'},
		{headerName: 'Duración', field: 'Duration', editable: true},
		{headerName: 'Proveedor', field: 'Provider', editable: true},
		{headerName: 'Ubicación', field: 'Location', editable: true},
		{headerName: 'Falta', field: 'Absence', editable: true},
		{headerName: '',
			headerCheckboxSelection: true,
			headerCheckboxSelectionFilteredOnly: true,
			checkboxSelection: true,
			headerComponentParams : { menuIcon: 'fa-external-link'},
			cellEditor: agGridComp.rowActions,
			editable: true
		}
	];

	$scope.gridOptions = {
		columnDefs: columnDefs,
		rowData: records,
		enableFilter: true,
		editType: 'fullRow',
		angularCompileRows: true,
		suppressRowClickSelection: true,
		rowSelection: 'multiple',
		animateRows: true,
		onGridReady: function (){
			$scope.gridOptions.api.sizeColumnsToFit();
		},
		onRowEditingStarted: function (rowObj) {
			// Nothing to do yet
			console.log('Row edition started', rowObj);
		},
		onRowValueChanged: function(rowObj) {
			console.log('Row data changed', rowObj);
		}
	};

	//
	// End of AG-Grid
	//
}];