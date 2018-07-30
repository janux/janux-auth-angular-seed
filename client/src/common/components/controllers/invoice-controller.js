'use strict';

var agGridComp = require('common/ag-grid-components');
var moment = require('moment');

module.exports =
	['$scope', '$modal', 'invoiceService', '$state', '$timeout', '$filter', '$rootScope', 'config', function (
		$scope, $modal, invoiceService, $state, $timeout, $filter, $rootScope, config) {
		var columnDefs = [
			{
				headerName  : '',
				field       : 'view',
				width       : 50,
				cellRenderer: agGridComp.viewInvoiceDetailCellRenderer,
				hide        : !$rootScope.userRole.can("UPDATE", "INVOICE")
			},
			{
				headerName: $filter('translate')('services.invoice.invoiceNumber'),
				field     : 'invoiceNumber'
			},
			{
				headerName    : $filter('translate')('services.invoice.invoiceDate'),
				field         : 'invoiceDate',
				filter        : 'date',
				valueFormatter: function (params) {
					return moment(params.data.invoiceDate).format(config.dateFormats.dateOnlyFormat);
				}
			},
			{
				headerName    : $filter('translate')('services.invoice.status'),
				field         : 'status',
				valueFormatter: function (params) {
					var result = '';
					switch (params.data.status) {
						case config.invoice.status.inRevision:
							result = $filter('translate')('services.invoice.statuses.inRevision');
							break;
						case config.invoice.status.ended:
							result = $filter('translate')('services.invoice.statuses.ended');
							break;
					}
					return result;
				}
			},
			{
				headerName    : $filter('translate')('services.invoice.grandTotal'),
				field         : 'grandTotal',
				valueFormatter: function (params) {
					return $filter('currency')(params.data.grandTotal);
				},
				cellStyle     : {'text-align': 'right'}
			}
		];


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

		function deleteConfirmed(rowsToDelete) {
			$scope.gridOptions.api.updateRowData({remove: rowsToDelete});
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

		var agGridSizeToFit = function () {
			$timeout(function () {
				$scope.gridOptions.api.sizeColumnsToFit();
			}, 1000);
		};

		$scope.agGridSizeToFit = agGridSizeToFit;

		$scope.gridOptions = {
			columnDefs               : columnDefs,
			rowData                  : $scope.invoices,
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

		$scope.$on('sideMenuSizeChange', function () {
			agGridSizeToFit();
		});

		// We need to reload because when the language changes ag-grid doesn't reload by itself
		$rootScope.$on('$translateChangeSuccess', function () {
			console.log('$translateChangeSuccess');
			$state.reload();
		});


		// This is a custom event that helps to update the invoice list.
		$rootScope.$on(config.invoice.events.invoiceListUpdated, function (event, invoices) {
			$scope.invoices = invoices;
			$scope.gridOptions.api.setRowData($scope.invoices);
			agGridSizeToFit();
		});
	}];
