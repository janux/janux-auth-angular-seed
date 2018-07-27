'use strict';

var agGridComp = require('common/ag-grid-components');
var moment = require('moment');

module.exports =
	['$scope', '$modal', 'invoiceService', '$state', '$timeout', '$filter', '$rootScope', 'config', 'operationService', function (
		$scope, $modal, invoiceService, $state, $timeout, $filter, $rootScope, config, operationService) {

		$scope.vehicles = [];

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

		var columnDefs = [
			// Vehicle.
			{
				headerName  : $filter('translate')('services.invoice.invoiceDetail.vehicle'),
				field       : 'vehicle',
				filter      : 'agTextColumnFilter',
				valueGetter : function (params) {
					var vehicle = params.data.timeEntry.vehicle.resource;
					return vehicle.name + " " + vehicle.plateNumber;
				},
				filterParams: {newRowsAction: 'keep'}
			},
			// Time Entry only date.
			{
				headerName    : $filter('translate')('services.invoice.invoiceDetail.date'),
				field         : 'timeEntry.begin',
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
					return (params.data.timeEntry.begin) ? moment(params.data.timeEntry.begin).format(config.dateFormats.dateOnlyFormat) : '';
				}
			},
			// Time Entry only hour.
			{
				headerName    : $filter('translate')('services.invoice.invoiceDetail.hour'),
				field         : 'timeEntry.begin',
				width         : 95,
				filterParams  : {
					newRowsAction: 'keep'
				},
				valueFormatter: function (params) {
					return (params.data.timeEntry.begin) ? moment(params.data.timeEntry.begin).format(config.dateFormats.hourOnlyFormat) : '';
				}
			},
			{
				headerName  : $filter('translate')('services.invoice.invoiceDetail.duration'),
				field       : 'timeEntry.duration',
				filterParams: {
					newRowsAction: 'keep'
				},
				width       : 95
			},
			//Rate day vehicle.
			{
				headerName    : $filter('translate')('services.invoice.invoiceDetail.costDay'),
				field         : 'parameters.rateVehicle.costDay',
				filterParams  : {
					newRowsAction: 'keep'
				},
				valueFormatter: function (params) {
					return $filter('currency')(params.value);
				},
				width         : 120,
				cellStyle     : {'text-align': 'right'}
			},
			// Subtotal.
			{
				headerName    : $filter('translate')('services.invoice.invoiceDetail.subTotal'),
				field         : 'parameters.rateVehicle.totalAfterDiscount',
				filterParams  : {
					newRowsAction: 'keep'
				},
				valueFormatter: function (params) {
					return $filter('currency')(params.value);
				},
				width         : 120,
				cellStyle     : {'text-align': 'right'}
			},
			{
				headerName  : $filter('translate')('services.invoice.invoiceDetail.doNotInvoice'),
				cellRenderer: agGridComp.doNotInvoiceVehicleCellRenderer,
				//headerComponent: agGridComp.deleteRowsHeaderComponent,
				field       : 'doNotInvoiceVehicle',
				width       : 65
			}
		];

		var agGridSizeToFit = function () {
			$timeout(function () {
				$scope.gridOptions.api.sizeColumnsToFit();
			}, 1000);
		};

		$scope.gridOptions = {
			columnDefs               : columnDefs,
			rowData                  : $scope.vehicles,
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

		$scope.filterVehicle = function () {
			//The invoice is located at $scope.invoice.
			var result = [];

			if (!_.isNil($scope.invoice) && !_.isNil($scope.invoice.items)) {
				for (var i = 0; i < $scope.invoice.items.length; i++) {
					var item = $scope.invoice.items[i];
					var itemTimeEntries = _.filter(item.timeEntries, function (o) {
						return _.filter(o.timeEntry.resources, function (te) {
							return te.type === 'VEHICLE';
						}).length > 0;
					});
					result = result.concat(itemTimeEntries);
				}

				result = _.map(result, function (o) {
					o.timeEntry.vehicle = _.find(o.timeEntry.resources, function (it) {
						return it.type === 'VEHICLE';
					});
					return o;
				});
			}

			$scope.vehicles = result;
			$scope.gridOptions.api.setRowData($scope.vehicles);
		};

		// We need to reload because when the language changes ag-grid doesn't reload by itself
		$rootScope.$on('$translateChangeSuccess', function () {
			console.log('$translateChangeSuccess');
			$state.reload();
		});

		//This event is captured, when the information of the selected invoice changes.
		$rootScope.$on(config.invoice.events.invoiceDetailUpdated, function (event, invoice) {
			$scope.invoice = invoice;
			$scope.filterVehicle();
			agGridSizeToFit();
		});

		$scope.$on('sideMenuSizeChange', function () {
			agGridSizeToFit();
		});

		$scope.agGridSizeToFit = agGridSizeToFit;

		$scope.$on(config.invoice.events.invoiceEditModeEnabled, function () {
			$scope.editModeInvoiceDetail = true;
		});
		$scope.$on(config.invoice.events.invoiceEditModeDisabled, function () {
			$scope.editModeInvoiceDetail = false;
		});
	}];
