'use strict';

var _ = require('lodash');
var agGridComp = require('common/ag-grid-components');

module.exports = [
	'$scope', '$rootScope', '$state', 'clientsList', '$timeout', '$filter', 'partyService', function ($scope, $rootScope, $state, clientsList, $timeout, $filter, partyService) {

		$scope.editClient = function (id) {
			$state.go('client.edit', {id: id, tab: 'client'});
		};

		console.debug('Cadena Clients List', clientsList);
		$scope.clientsList = clientsList;

		//
		// AG-Grid
		//
		var columnDefs = [
			{
				headerName  : $filter('translate')('client.name'),
				field       : 'name',
				editable    : false,
				width       : 300,
				filter      : 'agTextColumnFilter',
				sort        : 'asc',
				filterParams: {newRowsAction: 'keep'}
			},
			{
				headerName  : $filter('translate')('client.code'),
				field       : 'code',
				editable    : false,
				width       : 200,
				filter      : 'agTextColumnFilter',
				filterParams: {newRowsAction: 'keep'}
			},
			{
				headerName  : $filter('translate')('client.address'),
				field       : 'clientDisplayAddress',
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
			// {
			// 	headerName  : $filter('translate')('client.reseller'),
			// 	field       : 'reseller',
			// 	editable    : false,
			// 	filter      : 'agTextColumnFilter',
			// 	width       : 100,
			// 	filterParams: {newRowsAction: 'keep'}
			// },
			{
				headerName  : '',
				field       : 'id',
				width       : 50,
				cellRenderer: agGridComp.editClientCellRenderer
			}
		];

		var agGridSizeToFit = function () {
			$timeout(function () {
				$scope.gridOptions.api.sizeColumnsToFit();
			}, 1000);
		};
		$scope.agGridWindowSizeChange = function (windowWidth) {
			//console.debug('ancho de ventana',windowWidth);
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
			rowData                  : clientsList,
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
				// console.debug('Row edition started', rowObj);
			},
			onRowValueChanged        : function (rowObj) {
				console.debug(rowObj);

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
			// 	// console.debug('savedFilters' + JSON.stringify(savedFilters));
			// }
			// components:{
			// 	dateComponent: agGridComp.dateFilter
			// }
		};

		$scope.$on('sideMenuSizeChange', function () {
			agGridSizeToFit();
		});

		$scope.$on('agGridWindowSize', function (event, windowWidth) {
			//console.debug('tamaño',windowWidth);
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
			console.debug('$translateChangeSuccess');
			$state.reload();
		});

		console.debug($scope.gridOptions);

		// $scope.init();


	}];
