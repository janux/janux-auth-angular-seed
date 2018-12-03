'use strict';

var _ = require('lodash');
var agGridComp = require('common/ag-grid-components');

module.exports = [
	'$scope', '$rootScope', '$state', 'suppliers', '$timeout', '$filter', 'partyService', function ($scope, $rootScope, $state, suppliers, $timeout, $filter, partyService) {

		$scope.editClient = function (id) {
			$state.go('supplier.edit', {id: id, tab: 'supplier'});
		};

		// $scope.init = function () {
		// 	$scope.suppliersList = suppliers;
		// };

		console.log('Cadena Suppliers List', suppliers);
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
				headerName  : $filter('translate')('supplier.code'),
				field       : 'code',
				editable    : false,
				width       : 200,
				filter      : 'agTextColumnFilter',
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
				editable    : false,
				filter      : 'agTextColumnFilter',
				filterParams: {newRowsAction: 'keep'},
				valueGetter : function (params) {
					return partyService.getDefaultEmailAddress(params.data);
				}
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
				headerName  : '',
				field       : 'id',
				width       : 50,
				cellRenderer: agGridComp.editSupplierCellRenderer
			}
		];

		var agGridSizeToFit = function () {
			$timeout(function () {
				$scope.gridOptions.api.sizeColumnsToFit();
			}, 1000);
		};
		$scope.agGridWindowSizeChange = function (windowWidth) {
			//console.log('ancho de ventana',windowWidth);
			if (100 < windowWidth && windowWidth < 700) {
				_.mapValues(columnDefs, function (o) {
					switch (o.field) {
						case 'code':
						case 'contact':
						case 'email':
						case 'phone':
						case 'celphone':

							o.hide = true;
							break;
					}

					return o;
				});
				$scope.gridOptions.api.setColumnDefs(columnDefs);
			} else {
				_.mapValues(columnDefs, function (o) {
					switch (o.field) {
						case 'code':
						case 'contact':
						case 'email':
						case 'phone':
						case 'celphone':

							o.hide = false;
							break;
					}

					return o;
				});
				$scope.gridOptions.api.setColumnDefs(columnDefs);
			}
			agGridSizeToFit();
		};

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
		$scope.$on('agGridWindowSize', function (event, windowWidth) {
			//console.log('tamaño',windowWidth);
			if (100 < windowWidth && windowWidth < 700) {
				_.mapValues(columnDefs, function (o) {
					switch (o.field) {
						case 'code':
						case 'contact':
						case 'email':
						case 'phone':
						case 'celphone':

							o.hide = true;
							break;
					}

					return o;
				});
				$scope.gridOptions.api.setColumnDefs(columnDefs);
			}
		});

		// We need to reload because when the language changes ag-grid doesn't reload by itself
		$rootScope.$on('$translateChangeSuccess', function () {
			console.log('$translateChangeSuccess');
			$state.reload();
		});

		console.log($scope.gridOptions);

		// $scope.init();
	}];
