'use strict';

var agGridComp = require('common/ag-grid-components');
var moment = require('moment');
var _ = require('lodash');

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
			// Time Entry only hour begin.
			{
				headerName    : $filter('translate')('services.invoice.invoiceDetail.begin'),
				field         : 'timeEntry.begin',
				width         : 95,
				filterParams  : {
					newRowsAction: 'keep'
				},
				valueFormatter: function (params) {
					if (_.isDate(params.data.timeEntry.begin) && _.isDate(params.data.timeEntry.end) && params.data.timeEntry.duration !== '0:00') {
						return (params.data.timeEntry.begin) ? moment(params.data.timeEntry.begin).format(config.dateFormats.hourOnlyFormat) : '';
					} else {
						return (params.data.timeEntry.beginWork) ? moment(params.data.timeEntry.beginWork).format(config.dateFormats.hourOnlyFormat) : '';
					}
				}
			},
			// Time Entry only hour end.
			{
				headerName    : $filter('translate')('services.invoice.invoiceDetail.end'),
				field         : 'timeEntry.begin',
				width         : 95,
				filterParams  : {
					newRowsAction: 'keep'
				},
				valueFormatter: function (params) {
					// improve  the way what hours are being used for invoice.
					if (_.isDate(params.data.timeEntry.begin) && _.isDate(params.data.timeEntry.end) && params.data.timeEntry.duration !== '0:00') {
						return (params.data.timeEntry.end) ? moment(params.data.timeEntry.end).format(config.dateFormats.hourOnlyFormat) : '';
					} else {
						return (params.data.timeEntry.endWork) ? moment(params.data.timeEntry.endWork).format(config.dateFormats.hourOnlyFormat) : '';
					}
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
				if (!_.isNil($scope.gridOptions.api)) {
					$scope.gridOptions.api.sizeColumnsToFit();
				} else {
					console.warn('Trying to access null ag-grid from invoice-detail-vehicle-controller');
				}
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
			rowHeight                : 30,
			headerHeight             : 35,
			enableSorting            : true,
			pagination               : false,
			paginationAutoPageSize   : false,
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
			if (_.isNil($scope.gridOptions.api)) {
				console.warn("Call to setRowData with ag-grid null in invoice-detail-vehicle-controller");
			} else {
				$scope.gridOptions.api.setRowData($scope.vehicles);
			}
		};

		// We need to reload because when the language changes ag-grid doesn't reload by itself
		var unbindFunction1 = $rootScope.$on('$translateChangeSuccess', function () {
			console.log('$translateChangeSuccess');
			$state.reload();
		});

		//This event is captured, when the information of the selected invoice changes.
		var unbindFunction2 = $rootScope.$on(config.invoice.events.invoiceDetailUpdated, function (event, invoice) {
			$scope.invoice = invoice;
			$scope.filterVehicle();

			var vehiclesGridHeight = ($scope.vehicles.length * $scope.gridOptions.rowHeight) + ($scope.gridOptions.headerHeight + 16);
			if (vehiclesGridHeight <= 51) {
				vehiclesGridHeight = 130;
			}
			$rootScope.$broadcast(config.invoice.events.invoiceVehiclesUpdated, vehiclesGridHeight);

			agGridSizeToFit();
		});

		var unbindFunction3 = $scope.$on('sideMenuSizeChange', function () {
			agGridSizeToFit();
		});

		$scope.agGridSizeToFit = agGridSizeToFit;

		var unbindFunction4 = $scope.$on(config.invoice.events.invoiceEditModeEnabled, function () {
			$scope.editModeInvoiceDetail = true;
		});

		var unbindFunction5 = $scope.$on(config.invoice.events.invoiceEditModeDisabled, function () {
			$scope.editModeInvoiceDetail = false;
		});

		// Unregister listeners
		$scope.$on('$destroy', function () {
			if (_.isFunction(unbindFunction1)) {
				unbindFunction1();

			}
			if (_.isFunction(unbindFunction2)) {
				unbindFunction2();
			}
			if (_.isFunction(unbindFunction3)) {
				unbindFunction3();
			}
			if (_.isFunction(unbindFunction4)) {
				unbindFunction4();
			}
			if (_.isFunction(unbindFunction5)) {
				unbindFunction5();
			}
		});
	}];
