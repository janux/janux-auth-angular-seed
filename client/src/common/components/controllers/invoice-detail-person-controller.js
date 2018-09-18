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
					var person = params.data.timeEntry.staff.resource;
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

			//Type
			{
				headerName    : $filter('translate')('operations.specialsTimeLog.function'),
				editable      : false,
				filter        : 'agTextColumnFilter',
				filterParams  : {newRowsAction: 'keep'},
				valueFormatter: function (params) {
					var locale
					const resourcePerson = _.find(params.data.timeEntry.resources, function (it) {
						return it.type !== 'VEHICLE'
					});
					switch (resourcePerson.type) {
						case 'DRIVER':
							locale = 'operations.specialsTimeLog.driver';
							break;
						case 'AGENT':
							locale = 'operations.specialsTimeLog.agent';
							break;
						case 'AGENT_ARMED':
							locale = 'operations.specialsTimeLog.agentArmed';
							break;
						case 'GREETER':
							locale = 'operations.specialsTimeLog.greeter';
							break;
						case 'COORDINATOR':
							locale = 'operations.specialsTimeLog.coordinator';
							break;
						case 'TRANSPORT':
							locale = 'operations.specialsTimeLog.transport';
							break;
					}
					if (!_.isNil(locale)) {
						return $filter('translate')(locale);
					} else {
						return '';
					}

				}
			},

			//Rate day person.
			{
				headerName    : $filter('translate')('services.invoice.invoiceDetail.costDay'),
				field         : 'parameters.ratePerson.costDay',
				filterParams  : {
					newRowsAction: 'keep'
				},
				valueFormatter: function (params) {
					return $filter('currency')(params.value);
				},
				width         : 120,
				cellStyle     : {'text-align': 'right'}
			},

			//Rate hour person.
			{
				headerName    : $filter('translate')('services.invoice.invoiceDetail.costHour'),
				field         : 'parameters.ratePerson.costExtraHour',
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
				field         : 'parameters.ratePerson.totalAfterDiscount',
				filterParams  : {
					newRowsAction: 'keep'
				},
				valueFormatter: function (params) {
					return $filter('currency')(params.value);
				},
				width         : 120,
				cellStyle     : {'text-align': 'right'}
			},
			// Do not invoice.
			{
				headerName  : $filter('translate')('services.invoice.invoiceDetail.doNotInvoice'),
				cellRenderer: agGridComp.doNotInvoicePersonCellRenderer,
				//headerComponent: agGridComp.deleteRowsHeaderComponent,
				field       : 'doNotInvoice',
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
			rowData                  : $scope.persons,
			enableFilter             : true,
			enableColResize          : true,
			angularCompileRows       : true,
			suppressRowClickSelection: true,
			rowSelection             : 'multiple',
			animateRows              : true,
			rowHeight                : 30,
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
			if (!_.isNil($scope.invoice) && !_.isNil($scope.invoice.items)) {
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
			}

			$scope.persons = result;
			$scope.gridOptions.api.setRowData($scope.persons);
		};

		//This event is captured, when the information of the selected invoice changes.
		$rootScope.$on(config.invoice.events.invoiceDetailUpdated, function (event, invoice) {
			$scope.invoice = invoice;
			$scope.filterPersons();
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
