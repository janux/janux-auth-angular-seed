'use strict';

var _ = require('lodash');
var agGridComp = require('common/ag-grid-components');


module.exports = [
	'$scope', '$rootScope', '$state', 'partyService', 'partyGroupService', 'resourceService', 'config', '$timeout','$filter', 'staffList', 'assignableResources','supplier',
	function ($scope, $rootScope, $state, partyService, partyGroupService, resourceService, config, $timeout, $filter, staffList, assignableResources, supplier) {

		$scope.editStaff = function (id) {
			$state.go('staff.edit', {id: id});
		};

		// console.log('Cadena Staff List',staffList);
		// console.log('supplier', supplier);

		$scope.$on('agGridAvalabilityCheckboxChange',function(event,value){
			console.log('agGridAvalabilityCheckboxChange',value);

			if (value.isAvailable === false) {
				// Remove the resource.
				var resourceToRemove = _.find(assignableResources, function (o) {
					return o.resource.id === value.staffId;
				});

				if (_.isNil(resourceToRemove) === false) {
					// Remove the resource.
					resourceService.removeByIdsWithValidation([resourceToRemove.id])
						.then(function () {
							$scope.refreshResources();
						});
				}
			} else {
				// For the moment the type is driver. Later maybe allow the user to chose
				// The capabilities of the resource.
				var newResource = {
					type      : 'DRIVER',
					resource  : _.find(staffList, function (o) {
						return o.id === value.staffId;
					}),
					vendor    : supplier,
					assignable: true
				};
				// console.log('new newResource',newResource);
				resourceService.insertMany([newResource])
					.then(function (result) {
						console.log('inserted resources: ' + JSON.stringify(result));
						$scope.refreshResources();
					});
			}


		});

		// $scope.findSupplier = function () {
		// 	partyService.findOne(config.glarus)
		// 		.then(function (result) {
		// 			$scope.supplier = result;
		// 		});
		// };
		// $scope.init = function () {
		// 	partyGroupService.findOne('glarus_staff_group')
		// 		.then(function (result) {
		// 			// console.log('result ' + JSON.stringify(result));
		// 			var parties = _.map(result.values, function (o) {
		// 				o.party.staffDisplayName = o.party.name.last+' '+o.party.name.maternal+' '+o.party.name.first+' '+o.party.name.middle;
		// 				return o.party;
		// 			});
		// 			$scope.staffList = parties;
		// 			staffList = parties;
		// 			$scope.refreshResources();
		// 			$scope.findSupplier();
		// 		});
		// };

		$scope.refreshResources = function () {
			resourceService.findAvailableResourcesByVendor(config.glarus)
				.then(function (resources) {
					$scope.assignableResources = resources;
					$scope.staffList = _.map($scope.staffList, function (it) {
						var resource = _.find(resources, function (res) {
							return res.resource.id === it.id;
						});
						it.isAvailable = _.isNil(resource) === false;
						return it;
					});
				});
		};


		//
		// AG-Grid
		//
		var columnDefs = [
			{
				headerName  : $filter('translate')('party.person.lastName'),
				field       : 'staffDisplayLastName',
				editable    : false,
				filter      : 'agTextColumnFilter',
				sort        : 'asc',
				filterParams: {newRowsAction: 'keep'}
			},
			{
				headerName  : $filter('translate')('party.person.name'),
				field       : 'staffDisplayFirstName',
				editable    : false,
				filter      : 'agTextColumnFilter',
				filterParams: {newRowsAction: 'keep'}
			},
			{
				headerName  : $filter('translate')('party.phone'),
				field       : 'staffDisplayPhone',
				editable    : false,
				filter      : 'agTextColumnFilter',
				filterParams: {newRowsAction: 'keep'}
			},
			{
				headerName  : $filter('translate')('party.email'),
				field       : 'staffDisplayEmail',
				editable    : false,
				filter      : 'agTextColumnFilter',
				filterParams: {newRowsAction: 'keep'}
			},
			{
				headerName  : $filter('translate')('party.person.area'),
				field       : 'jobDepartment',
				editable    : false,
				valueGetter : function (params) {
					var result;
					if (_.isNil(params.data.staff)) {
						result = '';
					} else {
						result = params.data.staff.jobDepartment;
					}
					return result;
				},
				filter      : 'agTextColumnFilter',
				width       : 150,
				filterParams: {newRowsAction: 'keep'}
			},
			{
				headerName  : $filter('translate')('staff.userName'),
				field       : 'user',
				editable    : false,
				valueGetter : function (params) {
					var result;
					if (_.isNil(params.data.user)) {
						result = '';
					} else {
						var inv = params.data.user.invitation;
						if (!_.isNil(inv)) {
							switch (inv.status) {
								case 'pending':
									result = '';
								break;
								case 'completed':
									result = params.data.user.username;
								break;
							}
						} else {
							result = params.data.user.username;
						}
					}
					return result;
				},
				cellRenderer: agGridComp.usernameCellRenderer,
				filter      : 'agTextColumnFilter',
				width       : 150,
				filterParams: {newRowsAction: 'keep'}
			},
			{
				headerName  : $filter('translate')('staff.contractor'),
				field       : 'contractor',
				cellRenderer   : agGridComp.contractorStaffCellRenderer,
				editable    : false,
				valueGetter : function (params) {
					var result;
					if (_.isNil(params.data.staff)) {
						result = false;
					} else {
						result = params.data.staff.isExternal;
					}
					return result;
				},
				filter      : 'agTextColumnFilter',
				width       : 120,
				filterParams: {newRowsAction: 'keep'}
			},
			{
				headerName     : $filter('translate')('supplier.available'),
				cellRenderer   : agGridComp.checkBoxStaffAvalability,
				//headerComponent: agGridComp.deleteRowsHeaderComponent,
				field          : 'availableColumn',
				width          : 100
			},
			{
				headerName     : '',
				field          : 'id',
				width          : 50,
				cellRenderer   : agGridComp.editStaffCellRenderer
			}
		];

		var agGridSizeToFit = function () {
			$timeout(function () {
				$scope.gridOptions.api.sizeColumnsToFit();
			}, 1000);
		};
		$scope.agGridWindowSizeChange = function(windowWidth){
			console.log('ancho de ventana',windowWidth);
			if(100 < windowWidth && windowWidth < 700){
				_.mapValues(columnDefs, function (o) {
					switch(o.field){
						case 'staffDisplayPhone':
						case 'staffDisplayEmail':
						case 'jobDepartment':
						case 'user':
						case 'contractor':
						case 'availableColumn':

						o.hide=true;
						break;
					}

					return o;
				});
				$scope.gridOptions.api.setColumnDefs(columnDefs);
			}else{
				_.mapValues(columnDefs, function (o) {
					switch(o.field){
						case 'staffDisplayPhone':
						case 'staffDisplayEmail':
						case 'jobDepartment':
						case 'user':
						case 'contractor':
						case 'availableColumn':

						o.hide=false;
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
			rowData                  : staffList,
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
				// console.log('Row edition started', rowObj);
			},
			onRowValueChanged        : function (rowObj) {
				console.log(rowObj);

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
			// 	// console.log('savedFilters' + JSON.stringify(savedFilters));
			// }
			// components:{
			// 	dateComponent: agGridComp.dateFilter
			// }
		};

		$scope.$on('sideMenuSizeChange', function () {
			agGridSizeToFit();
		});

		$scope.$on('agGridWindowSize',function(event,windowWidth){
			console.log('tamaño',windowWidth);
			if(100 < windowWidth && windowWidth < 700){
				_.mapValues(columnDefs, function (o) {
					switch(o.field){
						case 'staffDisplayPhone':
						case 'staffDisplayEmail':
						case 'jobDepartment':
						case 'user':
						case 'contractor':
						case 'availableColumn':

						o.hide=true;
						break;
					}

					return o;
				});
				$scope.gridOptions.api.setColumnDefs(columnDefs);
			}
		});

		// We need to reload because when the language changes ag-grid doesn't reload by itself
		$rootScope.$on('$translateChangeSuccess', function () {
			console.log('$translateChangeSuccess');
			$state.reload();
		});

		console.log($scope.gridOptions);

		// $scope.init();
	}];
