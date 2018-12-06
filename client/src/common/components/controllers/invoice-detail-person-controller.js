'use strict';

var agGridComp = require('common/ag-grid-components');
var moment = require('moment');
var _ = require('lodash');


module.exports =
	['$scope', '$modal', 'invoiceService', '$state', '$timeout', '$filter', '$rootScope', 'config', 'nameQueryService', 'operationService', function (
		$scope, $modal, invoiceService, $state, $timeout, $filter, $rootScope, config, nameQueryService, operationService) {
		$scope.persons = [];


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
					// improve  the way what hours are being used for invoice.
					if (_.isDate(params.data.timeEntry.begin) && _.isDate(params.data.timeEntry.end) &&
						params.data.timeEntry.end.getTime() > params.data.timeEntry.begin.getTime()) {
						return (params.data.timeEntry.begin) ? moment(params.data.timeEntry.begin).format(config.dateFormats.hourOnlyFormat) : '';
					} else {
						return (params.data.timeEntry.beginWork) ? moment(params.data.timeEntry.beginWork).format(config.dateFormats.hourOnlyFormat) : '';
					}
				}
			},

			// Duration
			{
				headerName    : $filter('translate')('services.invoice.invoiceDetail.duration'),
				// field       : 'timeEntry.duration',
				filterParams  : {
					newRowsAction: 'keep'
				},
				width         : 95,
				valueFormatter: function (params) {
					if (params.data.timeEntry.duration !== '0:00') {
						return params.data.timeEntry.duration;
					} else {
						return params.data.timeEntry.durationWork;
					}
				}
			},

			//Type
			{
				headerName    : $filter('translate')('operations.specialsTimeLog.function'),
				editable      : false,
				filter        : 'agTextColumnFilter',
				filterParams  : {newRowsAction: 'keep'},
				valueFormatter: function (params) {
					var locale;
					const resourcePerson = _.find(params.data.timeEntry.resources, function (it) {
						return it.type !== 'VEHICLE'
					});

					const resourceVehicle = _.find(params.data.timeEntry.resources, function (it) {
						return it.type === 'VEHICLE'
					});

					const isArmored = resourceVehicle && resourceVehicle.resource.isArmored === true;
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
							if (isArmored === false) {
								locale = 'operations.specialsTimeLog.transport';
							} else {
								locale = 'operations.specialsTimeLog.transferArmoredVehicle';
							}
							break;
						case 'DRIVER_PLUS_VEHICLE':
							if (isArmored === false) {
								locale = 'operations.specialsTimeLog.driverPlusVehicle';
							} else {
								locale = 'operations.specialsTimeLog.driverPlusVehicleArmored';
							}
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
				if (!_.isNil($scope.gridOptions.api)) {
					$scope.gridOptions.api.sizeColumnsToFit();
				} else {
					console.warn('Trying to access null ag-grid from invoice-detail-person-controller');
				}
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

		// We need to reload because when the language changes ag-grid doesn't reload by itself
		var deregister1 = $rootScope.$on('$translateChangeSuccess', function () {
			console.debug('$translateChangeSuccess');
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
					o.timeEntry.durationWork = operationService.calculateDuration(o.timeEntry.beginWork, o.timeEntry.endWork);
					return o;
				});
			}

			$scope.persons = result;
			if (_.isNil($scope.gridOptions.api)) {
				console.warn("Call to setRowData with ag-grid null in invoice-detail-person-controller");
			} else {
				$scope.gridOptions.api.setRowData($scope.persons);
			}
		};

		//This event is captured, when the information of the selected invoice changes.
		var deregister2 = $rootScope.$on(config.invoice.events.invoiceDetailUpdated, function (event, invoice) {
			$scope.invoice = invoice;
			$scope.filterPersons();

			var personsGridHeight = ($scope.persons.length * $scope.gridOptions.rowHeight) + ($scope.gridOptions.headerHeight + 16);
			if (personsGridHeight <= 51) {
				personsGridHeight = 130;
			}
			$rootScope.$broadcast(config.invoice.events.invoicePersonsUpdated, personsGridHeight);

			agGridSizeToFit();
		});


		var deregister3 = $scope.$on('sideMenuSizeChange', function () {
			agGridSizeToFit();
		});

		$scope.agGridSizeToFit = agGridSizeToFit;

		var deregister4 = $scope.$on(config.invoice.events.invoiceEditModeEnabled, function () {
			$scope.editModeInvoiceDetail = true;
		});

		var deregister5 = $scope.$on(config.invoice.events.invoiceEditModeDisabled, function () {
			$scope.editModeInvoiceDetail = false;
		});


		// Unregister listeners
		$scope.$on('$destroy', function () {
			if (_.isFunction(deregister1)) {
				deregister1();

			}
			if (_.isFunction(deregister2)) {
				deregister2();
			}
			if (_.isFunction(deregister3)) {
				deregister3();
			}
			if (_.isFunction(deregister4)) {
				deregister4();
			}
			if (_.isFunction(deregister5)) {
				deregister5();
			}
		});


	}];
