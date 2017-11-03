'use strict';

var moment = require('moment');
var agGridComp = require('common/ag-grid-components');

module.exports = ['$scope', 'operationService', function ($scope, operationService) {


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
	$scope.addRow = function () {
		var start = moment($scope.lbRow.start);
		var end = moment($scope.lbRow.end);
		var duration = end.diff(start, 'hours') + ' hrs.';

		$scope.gridOptions.api.updateRowData({
			add: [{
				Personal: $scope.lbRow.personal,
				Service: $scope.lbRow.service,
				Start: start.format(dateTimeFormatString),
				End: end.format(dateTimeFormatString),
				Duration: duration,
				Provider: $scope.lbRow.provider,
				Location: $scope.lbRow.location,
				Absence: $scope.lbRow.absence
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