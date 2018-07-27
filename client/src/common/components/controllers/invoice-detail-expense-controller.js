'use strict';

var agGridComp = require('common/ag-grid-components');
var moment = require('moment');

module.exports =
	['$scope', '$modal', 'invoiceService', '$state', '$timeout', '$filter', '$rootScope', 'config', 'nameQueryService', '$mdDialog', function (
		$scope, $modal, invoiceService, $state, $timeout, $filter, $rootScope, config, nameQueryService, $mdDialog) {

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
				field       : 'person',
				filter      : 'agTextColumnFilter',
				valueGetter : function (params) {
					var person = params.data.person;
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
				cellStyle     : {'text-align': 'right'},
				filterParams  : {newRowsAction: 'keep'}
			},
			{
				headerName     : '',
				// headerCheckboxSelection: true,
				// headerCheckboxSelectionFilteredOnly: true,
				// checkboxSelection: true,
				cellRenderer   : agGridComp.checkBoxRowSelection,
				cellEditor     : agGridComp.rowActions,
				headerComponent: agGridComp.deleteRowsHeaderComponent,
				editable       : true,
				field          : 'selected',	// field needed to avoid ag-grid warning
				width          : 80
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

				// This function is defined to be able to trigger the deletion
				// of the rows from the header component that does not have access
				// to the scope.
				$scope.gridOptions.api.deleteRows = removeSelected;
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

		$scope.insertNewExpense = function () {
			$mdDialog.show(
				{
					locals             : {invoice: $scope.invoice},
					controller         : require('../../components/controllers/expense-detail-popup-controller'),
					templateUrl        : 'common/components/templates/expense-detail-popup.html',
					parent             : angular.element(document.body),
					clickOutsideToClose: true,
					flex               : "66"
				}
			).then(function () {
				// Send a "refresh" event.
				$rootScope.$broadcast(config.invoice.events.invoiceDetailSelected, $scope.invoice.invoiceNumber);
			});
		};

		$scope.agGridSizeToFit = agGridSizeToFit;

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

		function deleteConfirmed(rowsToDelete) {
			$scope.gridOptions.api.updateRowData({remove: rowsToDelete});
			var expensesToRemove = _.map(rowsToDelete, 'code');
			invoiceService.removeExpenses(expensesToRemove)
				.then(function () {
					// Send a "refresh" event.
					$rootScope.$broadcast(config.invoice.events.invoiceDetailSelected, $scope.invoice.invoiceNumber);
				})
		}
	}];
