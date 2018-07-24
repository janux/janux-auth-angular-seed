'use strict';

var agGridComp = require('common/ag-grid-components');
var moment = require('moment');

module.exports =
	['$scope', '$modal', 'invoiceService', '$state', '$timeout', '$filter', '$rootScope', 'config', 'nameQueryService', function (
		$scope, $modal, invoiceService, $state, $timeout, $filter, $rootScope, config, nameQueryService) {

		$scope.expenses = [];

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

		//The invoice is located at $scope.invoice.

		var columnDefs = [
			{
				headerName  : $filter('translate')('services.invoice.invoiceDetail.personName'),
				field       : 'client',
				filter      : 'agTextColumnFilter',
				valueGetter : function (params) {
					var person = params.data.client;
					return nameQueryService.createLongNameLocalized(person);

				},
				filterParams: {newRowsAction: 'keep'}
			},
			{
				headerName    : $filter('translate')('services.invoice.invoiceDetail.date'),
				field         : 'date',
				sort          : 'desc',
				width         : 100,
				filter        : 'date',
				filterParams  : {
					newRowsAction   : 'keep',
					inRangeInclusive: true,
					comparator      : agGridComp.dateFilterComparator,
					filterOptions   : ['equals', 'notEqual', 'lessThan', 'lessThanOrEqual', 'greaterThan', 'greaterThanOrEqual', 'inRange']
				},
				valueFormatter: function (params) {
					return (params.data.date) ? moment(params.data.date).format(config.dateFormats.dateOnlyFormat) : '';
				}
			},
			{
				headerName  : $filter('translate')('services.invoice.invoiceDetail.expenseName'),
				field       : 'name',
				filter      : 'agTextColumnFilter',
				filterParams: {newRowsAction: 'keep'}
			},
			{
				headerName    : $filter('translate')('services.invoice.invoiceDetail.subTotal'),
				field         : 'cost',
				valueFormatter: function (params) {
					return $filter('currency')(params.value);
				},
				cellStyle: {'text-align': 'right'},
				filterParams  : {newRowsAction: 'keep'}
			}

		];
		$scope.gridOptions = {
			columnDefs               : columnDefs,
			rowData                  : $scope.expenses,
			enableFilter             : true,
			enableColResize          : true,
			angularCompileRows       : true,
			suppressRowClickSelection: true,
			rowSelection             : 'multiple',
			animateRows              : true,
			rowHeight                : 33,
			headerHeight             : 35,
			enableSorting            : true,
			pagination               : true,
			paginationAutoPageSize   : true,
			onGridReady              : function () {
				agGridSizeToFit();
			},
			localeTextFunc           : function (key, defaultValue) {
				var gridKey = 'grid.' + key;
				var value = $filter('translate')(gridKey);
				return value === gridKey ? defaultValue : value;
			}
		};

		var agGridSizeToFit = function () {
			$timeout(function () {
				$scope.gridOptions.api.sizeColumnsToFit();
			}, 1000);
		};

		// We need to reload because when the language changes ag-grid doesn't reload by itself
		$rootScope.$on('$translateChangeSuccess', function () {
			console.log('$translateChangeSuccess');
			$state.reload();
		});

		$scope.filterExpenses = function () {
			var result = [];
			if (!_.isNil($scope.invoice) && !_.isNil($scope.invoice.items)) {
				for (var i = 0; i < $scope.invoice.items.length; i++) {
					var item = $scope.invoice.items[i];
					result = result.concat(item.expenses);
				}
			}

			$scope.expenses = result;
			$scope.gridOptions.api.setRowData($scope.expenses);
		};

		//This event is captured, when the information of the selected invoice changes.
		$rootScope.$on(config.invoice.events.invoiceDetailUpdated, function (event, invoice) {
			$scope.invoice = invoice;
			$scope.filterExpenses();
			agGridSizeToFit();
		});

		$scope.$on('sideMenuSizeChange', function () {
			agGridSizeToFit();
		});

		$scope.agGridSizeToFit = agGridSizeToFit;
	}];