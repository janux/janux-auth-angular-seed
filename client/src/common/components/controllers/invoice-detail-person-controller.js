'use strict';

var agGridComp = require('common/ag-grid-components');
var moment = require('moment');
var _ = require('lodash');


module.exports =
	['$scope', '$modal', 'invoiceService', '$state', '$timeout', '$filter', '$rootScope', 'config', 'nameQueryService', 'operationService', function (
		$scope, $modal, invoiceService, $state, $timeout, $filter, $rootScope, config, nameQueryService, operationService) {
		$scope.persons = [];

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
			{
				headerName  : $filter('translate')('services.invoice.invoiceDetail.personName'),
				field       : 'staff',
				filter      : 'agTextColumnFilter',
				valueGetter : function (params) {
					var person = params.data.staff.resource;
					return nameQueryService.createLongNameLocalized(person);

				},
				filterParams: {newRowsAction: 'keep'}
			},

			// Time Entry only date.
			{
				headerName    : $filter('translate')('services.invoice.invoiceDetail.date'),
				field         : 'timeEntry.begin',
				sort          : 'desc',
				width         : 160,
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

			// Duration
			{
				headerName  : $filter('translate')('services.invoice.invoiceDetail.duration'),
				field       : 'timeEntry.duration',
				filterParams: {
					newRowsAction: 'keep'
				},
				width       : 95
			},

			//Rate day person.
			{
				headerName  : $filter('translate')('services.invoice.invoiceDetail.rateDay'),
				field       : 'parameters.ratePerson.rateDay',
				filterParams: {
					newRowsAction: 'keep'
				},
				width       : 50
			},

			//Rate hour person.
			{
				headerName  : $filter('translate')('services.invoice.invoiceDetail.rateHour'),
				field       : 'parameters.ratePerson.rateHour',
				filterParams: {
					newRowsAction: 'keep'
				},
				width       : 50
			},
			// Subtotal.
			{
				headerName  : $filter('translate')('services.invoice.invoiceDetail.subTotal'),
				field       : 'parameters.ratePerson.totalAfterDiscount',
				filterParams: {
					newRowsAction: 'keep'
				},
				width       : 50
			}

		];

		var agGridSizeToFit = function () {
			$timeout(function () {
				$scope.gridOptions.api.sizeColumnsToFit();
			}, 1000);
		};

		$scope.gridOptionsPersons = {
			columnDefs               : columnDefs,
			rowData                  : $scope.persons,
			enableFilter             : true,
			enableColResize          : true,
			angularCompileRows       : true,
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
			},
			localeTextFunc           : function (key, defaultValue) {
				var gridKey = 'grid.' + key;
				var value = $filter('translate')(gridKey);
				return value === gridKey ? defaultValue : value;
			}
		};

		// We need to reload because when the language changes ag-grid doesn't reload by itself
		$rootScope.$on('$translateChangeSuccess', function () {
			console.log('$translateChangeSuccess');
			$state.reload();
		});


		/**
		 * This method prepares the person info to be ag-grid friendly
		 */
		$scope.filterPersons = function () {
			//The invoice is located at $scope.invoice.
			var result = [];

			for (var i = 0; i < $scope.invoice.items.length; i++) {
				var item = $scope.invoice.items[i];
				var itemTimeEntries = _.filter(item.timeEntries, function (o) {
					return _.filter(o.timeEntry.resources, function (te) {
						return te.type !== 'VEHICLE';
					}).length > 0;
				});
				result = result.concat(itemTimeEntries);
			}


			result = _.map(result, function (o) {
				o.timeEntry.staff = _.find(o.timeEntry.resources, function (it) {
					return it.type !== 'VEHICLE';
				});
				o.timeEntry.duration = operationService.calculateDuration(o.timeEntry.begin, o.timeEntry.end);
				return o;
			});
			$scope.persons = result;
			$scope.gridOptions.api.setRowData($scope.persons);
		};

		$scope.filterPersons();
	}];