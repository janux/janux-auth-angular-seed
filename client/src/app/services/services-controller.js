'use strict';

var agGridComp = require('common/ag-grid-components');
var _ = require('lodash');
var moment = require('moment');

module.exports =
['$scope','$modal','$filter','$timeout','operations','invoices','$state','$rootScope','config','jnxStorage','operationService', function(
  $scope , $modal , $filter , $timeout , operations , invoices , $state , $rootScope , config , jnxStorage,  operationService){

	console.log('operations', operations);

	var columnsFiltersKey = config.jnxStoreKeys.servicesColumnsFilters;
	var infoDialog = function (translateKey) {
		$modal.open({
			templateUrl: 'app/dialog-tpl/info-dialog.html',
			controller : ['$scope', '$modalInstance',
				function ($scope, $modalInstance) {
					$scope.message = $filter('translate')(translateKey);

					$scope.ok = function () {
						$modalInstance.close();
					};
				}],
			size       : 'md'
		});
	};

	$scope.openAddOperationMenu = function($mdMenu, ev) {
		$mdMenu.open(ev);
	};

	var agGridSizeToFit = function () {
		$timeout(function () {
			$scope.gridOptions.api.sizeColumnsToFit();
		}, 1000);
	};
	$scope.agGridSizeToFit = agGridSizeToFit;

	function deleteConfirmed(rowsToDelete) {
		$scope.gridOptions.api.updateRowData({remove: rowsToDelete});

		// TODO: Remove services
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
			infoDialog('operations.dialogs.noRowSelectedError');
		}
	};


	//
	// AG-Grid
	//
	var columnDefs = [
		{
			headerName     : '',
			field          : 'view',
			width          : 50,
			cellRenderer: agGridComp.viewOperationCellRenderer,
			hide        : !$rootScope.userRole.can('READ', 'SERVICE')
		},
		{
			headerName    : $filter('translate')('services.list.type'),
			field         : 'type',
			valueFormatter: function (params) {
				return $filter('translate')('services.list.' + params.value);
			},
			width         : 80
		},
		{
			headerName: $filter('translate')('services.list.name'),
			field     : 'name',
			width     : 160
		},
		{
			headerName: $filter('translate')('services.list.client'),
			field     : 'code',
			width     : 100,
			valueGetter : function (params) {
				var result;
				if (_.isString(params.data.code) && params.data.code.trim() !== '') {
					result = params.data.code;
				}else{
					result = params.data.client;
				}
				return result;
			}
		},
		{
			headerName: $filter('translate')('services.list.assigned'),
			field     : 'assigned'
		},
		{
			headerName    : $filter('translate')('services.list.duration'),
			field         : 'duration',
			valueFormatter: function (params) {
				return (params.value) ? $filter('amDurationFormat')(params.value, 'millisecond') : '';
			},
			width         : 80
		},
		{
			headerName    : $filter('translate')('services.list.begin'),
			field         : 'start',
			filter        : 'date',
			width         : 100,
			sort          : 'desc',
			valueFormatter: function (params) {
				if (_.isDate(params.data.start)) {
					return moment(params.data.start).format(config.dateFormats.dateOnlyFormat);
				} else {
					return '';
				}

			}

		},
		{
			headerName    : $filter('translate')('services.list.end'),
			field         : 'end',
			filter        : 'date',
			width         : 100,
			valueFormatter: function (params) {
				if (_.isDate(params.data.end)) {
					return moment(params.data.end).format(config.dateFormats.dateOnlyFormat);
				} else {
					return '';
				}
			}
		},
		{
			headerName: $filter('translate')('services.list.status'),
			width     : 80,
			valueGetter: function (params) {
				return operationService.generateStatus(params.data, invoices);
			}
		},
		{
			headerName     : '',
			cellRenderer   : agGridComp.checkBoxRowSelection,
			headerComponent: agGridComp.deleteRowsHeaderComponent,
			field          : 'selected',	// field needed to avoid ag-grid warning
			width          : 50,
			hide           : !$rootScope.userRole.can('DELETE', 'SERVICE')
		}
	];

	$scope.gridOptions = {
		columnDefs: columnDefs,
		rowData: operations,
		enableFilter: true,
		enableColResize: true,
		angularCompileRows       : true,
		suppressRowClickSelection: true,
		rowSelection: 'multiple',
		animateRows: true,
		rowHeight: 40,
		headerHeight: 35,
		enableSorting: true,
		pagination: true,
		paginationAutoPageSize: true,
		onGridReady: function () {
			agGridSizeToFit();

			// This function is defined to be able to trigger the deletion
			// of the rows from the header component that does not have access
			// to the scope.
			$scope.gridOptions.api.deleteRows = removeSelected;

			// Restore filter model.
			var filterModel = jnxStorage.findItem(columnsFiltersKey, true);
			// console.log('filterModel', filterModel);
			if (!_.isNil(filterModel)) {
				$scope.gridOptions.api.setFilterModel(filterModel);
				$scope.gridOptions.onFilterChanged();
			}
		},
		localeTextFunc: function (key, defaultValue) {
			var gridKey = 'grid.' + key;
			var value = $filter('translate')(gridKey);
			return value === gridKey ? defaultValue : value;
		},
		onFilterChanged          : function () {
			// Save filters to local storage.
			var savedFilters = $scope.gridOptions.api.getFilterModel();
			jnxStorage.setItem(columnsFiltersKey, savedFilters, true);
			// console.log('savedFilters' + JSON.stringify(savedFilters));
		}
	};

	$scope.$on('sideMenuSizeChange', function () {
		agGridSizeToFit();
	});

	// We need to reload because when the language changes ag-grid doesn't reload by itself
	$rootScope.$on('$translateChangeSuccess', function () {
		console.log('$translateChangeSuccess');
		$state.reload();
	});
}];
