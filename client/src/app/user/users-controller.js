'use strict';

var moment = require('moment');
var _ = require('lodash');
var agGridComp = require('common/ag-grid-components');

module.exports = [
'$scope', '$rootScope', 'userService','$state','users','$modal', '$q', '$filter', 'security', '$timeout', function(
 $scope , $rootScope, userService , $state , users , $modal, $q, $filter, security, $timeout) {

	$scope.usersMatch = users;
	$scope.searchField = 'username';
	$scope.searchString = '';

	$scope.searchFields = ['username', 'name', 'email', 'phone'];

	var infoDialog = function(translateKey){
		$modal.open({
			templateUrl: 'app/dialog-tpl/info-dialog.html',
			controller: ['$scope','$modalInstance',
				function($scope , $modalInstance) {
					$scope.message= $filter('translate')(translateKey);

					$scope.ok = function() {
						$modalInstance.close();
					};
				}],
			size: 'md'
		});
	};

	$scope.findUsers = function() {
		userService.findBy($scope.searchField, $scope.searchString, security.currentUser.username).then(function(usersMatch) {
			$scope.usersMatch = _.map(usersMatch,function(user){
				user.cdate = moment(user.cdate).format('YYYY-MM-DD HH:mm:ss');
				return user;
			});
			console.log('$scope.usersMatch', $scope.usersMatch);
		});
	};

	$scope.editUser = function(userId) {
		$state.go('users.edit', { userId: userId });
	};

	function deleteConfirmed(rowsToDelete) {
		$scope.gridOptions.api.updateRowData({remove: rowsToDelete});

		var selectedDataIds = _.map(rowsToDelete, 'userId');
		userService.deleteUser(selectedDataIds);
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

	// $scope.openDelete = function(){
	// 	var selectedIds = [];
	// 	for (var i = 0; i<$scope.usersMatch.length; i++) {
	// 		if($scope.usersMatch[i].Selected){
	// 			var userId = $scope.usersMatch[i].userId;
	// 			selectedIds.push(userId);
	// 		}
	// 	}

	// 	if(selectedIds.length>0) {
	// 		$modal.open({
	// 			templateUrl: 'app/dialog-tpl/confirm-dialog.html',
	// 			controller: ['$scope','$modalInstance','$filter',
	// 				function($scope , $modalInstance, $filter) {
	// 					$scope.message= $filter('translate')('user.dialogs.confirmDeletion');

	// 					$scope.ok = function() {
	// 						var userDeletionArray =[];
	// 						//TO DO Create Method inside server
	// 						for (var i = 0; i<selectedIds.length; i++) {
	// 							console.log(selectedIds[i]);
	// 							userDeletionArray.push(userService.deleteUser(selectedIds[i]));
	// 						}
	// 						$q.all(userDeletionArray).then(function(){
	// 							$state.go($state.current, {}, {reload: true});
	// 						});

	// 						$modalInstance.close();
	// 					};

	// 					$scope.cancel = function() {
	// 						$modalInstance.close();
	// 					};
	// 				}],
	// 			size: 'md'
	// 		});
	// 	}else{
	// 		infoDialog('user.dialogs.noRowSelectedError');
	// 	}
	// };

	console.log('Cadena Users List',users);
	$scope.usersList = users;

	//
	// AG-Grid
	//
	var columnDefs = [
		{
			headerName  : $filter('translate')('user.username'),
			field       : 'username',
			editable    : false,
			width       : 150,
			filter      : 'agTextColumnFilter',
			sort        : 'asc',
			filterParams: {newRowsAction: 'keep'}
		},
		{
			headerName  : $filter('translate')('user.displayName'),
			field       : 'usersDisplayName',
			editable    : false,
			width       : 400,
			filter      : 'agTextColumnFilter',
			filterParams: {newRowsAction: 'keep'}
		},
		{
			headerName  : $filter('translate')('user.role'),
			field       : 'usersDisplayRole',
			editable    : false,
			width       : 400,
			filter      : 'agTextColumnFilter',
			filterParams: {newRowsAction: 'keep'}
		},
		{
			headerName  : $filter('translate')('user.email'),
			field       : 'usersDisplayEmail',
			editable    : false,
			width       : 400,
			filter      : 'agTextColumnFilter',
			filterParams: {newRowsAction: 'keep'}
		},
		{
			headerName  : $filter('translate')('user.phone'),
			field       : 'phone',
			editable    : false,
			width       : 200,
			filter      : 'agTextColumnFilter',
			filterParams: {newRowsAction: 'keep'}
		},
		{
			headerName     : '',
			field          : 'userId',
			width          : 50,
			cellRenderer   : agGridComp.editUsersCellRenderer
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

	var agGridSizeToFit = function () {
		$timeout(function () {
			if (!_.isNil($scope.gridOptions.api)) {
				$scope.gridOptions.api.sizeColumnsToFit();
			} else {
				console.warn('Trying to access null ag-grid from users-controller');
			}
		}, 1000);
	};
	$scope.agGridWindowSizeChange = function(windowWidth){
		//console.log('ancho de ventana',windowWidth);
		if(100 < windowWidth && windowWidth < 700){
			_.mapValues(columnDefs, function (o) {
				switch(o.field){
					case 'usersDisplayRole':
					case 'usersDisplayEmail':
					case 'phone':
					case 'selected':

					o.hide=true;
					break;
				}

				return o;
			});
			$scope.gridOptions.api.setColumnDefs(columnDefs);
		}else{
			_.mapValues(columnDefs, function (o) {
				switch(o.field){
					case 'usersDisplayRole':
					case 'usersDisplayEmail':
					case 'phone':
					case 'selected':

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
		rowData                  : users,
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
			$scope.gridOptions.api.deleteRows = removeSelected;

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
		//console.log('tamaño',windowWidth);
		if(100 < windowWidth && windowWidth < 700){
			_.mapValues(columnDefs, function (o) {
				switch(o.field){
					case 'usersDisplayRole':
					case 'usersDisplayEmail':
					case 'phone':
					case 'selected':

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
