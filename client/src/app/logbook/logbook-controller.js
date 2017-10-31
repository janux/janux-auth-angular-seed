'use strict';

var moment = require('moment');
var records = require('./mock-data');
var agGridComp = require('common/ag-grid-components');

module.exports = ['$scope', function($scope) {

	// Mock data
	records.forEach(function (elem, iElem) {
		records[iElem+3] = elem;
	});

	var dateTimeFormatString = agGridComp.dateTimeCellEditor.formatString;

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
		var start = moment($scope.lbRow.start);
		var end = moment($scope.lbRow.end);
		var duration = end.diff(start, 'hours')+' hrs.';

		$scope.gridOptions.api.updateRowData({add:[{
			Personal: $scope.lbRow.personal,
			Service: $scope.lbRow.service,
			Start: start.format(dateTimeFormatString),
			End: end.format(dateTimeFormatString),
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
		{ headerName: 'Personal', field: 'Personal', editable: true },
		{ headerName: 'Servicio', field: 'Service', editable: true },
		{
			headerName: 'Inicio',
			field: 'Start',
			editable: true,
			filter:'date',
			cellEditor:agGridComp.dateTimeCellEditor
		},
		{
			headerName: 'Termino',
			field: 'End',
			editable: true,
			filter:'date',
			cellEditor:agGridComp.dateTimeCellEditor
		},
		{ headerName: 'Duración', field: 'Duration', editable: true },
		{ headerName: 'Proveedor', field: 'Provider', editable: true },
		{
			headerName: 'Ubicación',
			field: 'Location',
			editable: true,
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
		{ headerName: 'Falta', field: 'Absence', editable: true },
		{
			headerName: '',
			headerCheckboxSelection: true,
			headerCheckboxSelectionFilteredOnly: true,
			checkboxSelection: true,
			headerComponentParams : { menuIcon: 'fa-external-link'},
			cellEditor: agGridComp.rowActions,
			editable: true,
			field: 'Selected'	// field needed to avoid ag-grid warning
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
		rowHeight: 50,
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