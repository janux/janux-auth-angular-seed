'use strict';

var agGridComp = require('common/ag-grid-components');

module.exports = [
	'$scope','$rootScope', '$state','suppliers','$timeout','$filter', function ($scope, $rootScope, $state, suppliers, $timeout, $filter) {

		$scope.editClient = function (id) {
			$state.go('supplier.edit', {id: id, tab: 'supplier'});
		};

		// $scope.init = function () {
		// 	$scope.suppliersList = suppliers;
		// };

		console.log('Cadena Suppliers List',suppliers);
		$scope.suppliersList = suppliers;

		//
		// AG-Grid
		//
		var columnDefs = [
			{
				headerName  : $filter('translate')('supplier.name'),
				field       : 'name',
				editable    : false,
				width       : 300,
				filter      : 'agTextColumnFilter',
				sort        : 'asc',
				filterParams: {newRowsAction: 'keep'}
			},
			{
				headerName  : $filter('translate')('client.address'),
				field       : 'supplierDisplayAddress',
				editable    : false,
				width       : 400,
				cellStyle   : {
					'white-space': 'normal'
				},
				filter      : 'agTextColumnFilter',
				filterParams: {newRowsAction: 'keep'}
			},
			{
				headerName  : $filter('translate')('client.contact'),
				field       : 'contact',
				editable    : false,
				filter      : 'agTextColumnFilter',
				filterParams: {newRowsAction: 'keep'}
			},
			{
				headerName  : $filter('translate')('client.email'),
				field       : 'email',
				editable    : false,
				filter      : 'agTextColumnFilter',
				filterParams: {newRowsAction: 'keep'}
			},
			{
				headerName  : $filter('translate')('client.phone'),
				field       : 'phone',
				editable    : false,
				filter      : 'agTextColumnFilter',
				filterParams: {newRowsAction: 'keep'}
			},
			{
				headerName  : $filter('translate')('client.cellphone'),
				field       : 'celphone',
				editable    : false,
				filter      : 'agTextColumnFilter',
				filterParams: {newRowsAction: 'keep'}
			},
			{
				headerName     : '',
				field          : 'id',
				width          : 50,
				cellRenderer   : agGridComp.editSupplierCellRenderer
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
			rowData                  : suppliers,
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

				//$scope.gridOptions.api.deleteRows = removeSelected;

				// Restore filter model.

				// var filterModel = localStorageService.get(columnsFiltersKey);
				// if (!_.isNil(filterModel)) {
				// 	$scope.gridOptions.api.setFilterModel(filterModel);
				// 	$scope.gridOptions.onFilterChanged();
				// }
			},
			onRowEditingStarted      : function () {
				// Nothing to do yet
				// console.log('Row edition started', rowObj);
			},
			onRowValueChanged        : function (rowObj) {
				console.log(rowObj);

			}
			// localeTextFunc           : function (key, defaultValue) {
			// 	var gridKey = 'grid.' + key;
			// 	var value = $filter('translate')(gridKey);
			// 	return value === gridKey ? defaultValue : value;
			// },
			// onFilterChanged          : function () {
			// 	// Save filters to local storage.
			// 	var savedFilters;
			// 	savedFilters = $scope.gridOptions.api.getFilterModel();
			// 	localStorageService.set(columnsFiltersKey, savedFilters);
			// 	// console.log('savedFilters' + JSON.stringify(savedFilters));
			// }
			// components:{
			// 	dateComponent: agGridComp.dateFilter
			// }
		};

		$scope.$on('sideMenuSizeChange', function () {
			agGridSizeToFit();
		});

		// We need to reload because when the language changes ag-grid doesn't reload by itself
		$rootScope.$on('$translateChangeSuccess', function () {
			console.log('$translateChangeSuccess');
			$state.reload();
		});

		console.log($scope.gridOptions);

		// $scope.init();
	}];
