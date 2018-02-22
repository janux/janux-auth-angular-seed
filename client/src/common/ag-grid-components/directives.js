var _ = require('lodash');

angular.module('agGridDirectives',[])

.directive('agGridLargeText', ['$modal', function($modal) {
	return {
		restrict: 'A',
		scope: false,
		link: function (scope, elem, attrs) {
			elem.bind("touchstart click", function (e) {

				$modal.open({
					templateUrl: 'common/ag-grid-components/templates/large-text-cell-editor.html',
					controller: ['$scope','$modalInstance',
						function($scope , $modalInstance) {
							var model = attrs['ngModel'];
							$scope.data = scope[model];
							$scope.ok = function() {
								scope[model] = $scope.data;
								$modalInstance.close();
							};
						}],
					size: 'sm'
				});

				e.preventDefault();
				e.stopPropagation();
			});
		}
	}
}])

.directive('agGridVehicleAutocomplete', ['$modal', function( $modal ) {
	return {
		restrict: 'A',
		scope:false,
		link: function (scope, elem, attrs) {
			elem.bind("touchstart click", function (e) {
				$modal.open({
					templateUrl: 'common/ag-grid-components/templates/autocomplete-vehicle-cell-editor.html',
					controller: ['$scope','$modalInstance',
						function($scope , $modalInstance) {
							var model = attrs['ngModel'];
							$scope.data = scope[model];
							$scope.vehicles = scope.driversAndOps.vehicles;

							$scope.valueAutoVehicle = '';
							$scope.valueAutoVehiclePlaceholder = $scope.data;
							$scope.autoVehicleSelectedItem = '';

							$scope.agGridVehicleSelectedItemChange = function(item) {

							};

							function createFilterForVehicle(query) {
								return function filterFn(resource) {
									var name = resource.resource.name + resource.resource.plateNumber;
									var contains = name.toLowerCase().includes(query.toLowerCase());
									return contains;
								};
							}

							$scope.agGridVehicleSearch = function(query) {
								var out = query ? $scope.vehicles.filter( createFilterForVehicle(query) ) : $scope.vehicles;
								console.log('agGridVehicleSearch', out);
								return out;
							};

							$scope.ok = function() {
								scope[model] = $scope.data;
								$modalInstance.close();
							};
						}]
				});

				e.preventDefault();
				e.stopPropagation();
			});
		}
	}
}])

.directive('agGridStaffAutocomplete', [ function() {
	return {
		restrict: 'E',
		scope:false,
		templateUrl: 'common/ag-grid-components/templates/autocomplete-staff-cell-editor.html',
		controller: ['$scope','$attrs', function($scope,$attrs) {
			var resource = undefined;
			$scope.valueAutoStaff = ''; // $scope[$attrs.selectedValueModel];
			$scope.autoStaffSelectedItem = '';
			$scope.agGridOperationDrivers = $scope.driversAndOps.allPersonnelAvailableForSelection;
			if(_.isNil($scope[$attrs.selectedValueModel]) === false){
				resource = $scope[$attrs.selectedValueModel].resource;
				$scope.valueAutoStaffPlaceholder = resource.name.last+' '+resource.name.first;
				// $scope.driversAndOps comes form parent controller
			}else{
				$scope.valueAutoStaffPlaceholder = '';
			}



			//
			// Staff autocomplete
			//
			$scope.agGridStaffSelectedItemChange = function(item) {
				if(typeof item !== 'undefined') {
					// This item should contain the selected staff member
					console.info('Item changed to ' + JSON.stringify(item));

					// Update ag-grid cell value
					$scope[$attrs.selectedValueModel] = item;

					// Update operation according to selected staff
					// $scope.$broadcast('agGridSelectedOpChange', item);

				} else {
					// This means that the entered search text is empty or doesn't match any staff member
				}
			};

			function createFilterForStaff(query) {
				return function filterFn(operationDriver) {
					var driver = operationDriver.resource;
					var name = (driver.name.last+' '+driver.name.first).toLowerCase();
					var contains = name.toLowerCase().includes(query.toLowerCase());
					return contains;
				};
			}

			$scope.agGridStaffSearch = function(query) {
				var out = query ? $scope.agGridOperationDrivers.filter( createFilterForStaff(query) ) : $scope.agGridOperationDrivers;
				console.log('agGridStaffSearch', out);
				return out;
			};
		}]
	}
}])
.directive('agGridOpAutocomplete', [ function() {
	return {
		restrict: 'E',
		scope:false,
		templateUrl: 'common/ag-grid-components/templates/autocomplete-op-cell-editor.html',
		controller: ['$scope','$attrs', function($scope,$attrs) {

			var operation = $scope[$attrs.selectedValueModel];

			// $scope.driversAndOps comes form parent controller
			$scope.agGridOperations = $scope.driversAndOps.operations;
			$scope.agGridDriversAssignedToOperations = $scope.driversAndOps.driversAssignedToOperations;

			$scope.valueAutoOp = ''; // $scope[$attrs.selectedValueModel];
			$scope.valueAutoOpPlaceholder = operation.name;
			$scope.autoOpSelectedItem = '';

			//
			// Operation autocomplete
			//
			$scope.agGridOpsSelectedItemChange = function(item) {
				if(typeof item !== 'undefined') {
					// This item should contain the selected operation
					// console.info('Item changed to ' + JSON.stringify(item));
					$scope[$attrs.selectedValueModel] = item;
					// Update client cell
					$scope.$broadcast('agGridClientUpdate', item.client);
				} else {
					// This means that the entered search text is empty or doesn't match any operation
				}
			};

			function createFilterForOps(query) {
				return function filterFn(operation) {
					var contains = operation.name.toLowerCase().includes(query.toLowerCase());
					return contains;
				};
			}

			$scope.agGridOpsSearch = function(query) {
				return query ? $scope.agGridOperations.filter( createFilterForOps(query) ) : $scope.agGridOperations;
			};

			$scope.$on('agGridSelectedOpChange', function (event, staffItem) {
				var selectedDriver = _.find($scope.agGridDriversAssignedToOperations,function (o) {
					return o.id === staffItem.id;
				});

				var operationId = selectedDriver.opId;

				var staffOperations = _.filter($scope.agGridOperations, {id:operationId});

				$scope.autoOpSelectedItem = staffOperations[0];
				$scope[$attrs.selectedValueModel] = staffOperations[0].name;
				console.log('Staff assigned operations', staffOperations);

				$scope.$broadcast('agGridClientUpdate', staffOperations[0].client);
			});
		}]
	}
}])
.directive('agGridClientUpdater', [ function() {
	return {
		restrict: 'E',
		scope:false,
		templateUrl: 'common/ag-grid-components/templates/client-cell-updater.html'
	}
}])
.directive('agGridDurationUpdater', [ function() {
	return {
		restrict: 'E',
		scope:false,
		templateUrl: 'common/ag-grid-components/templates/duration-cell-updater.html'
	}
}])
.directive('agGridCommentEditor', [ function() {
	return {
		restrict: 'E',
		scope:false,
		templateUrl: 'common/ag-grid-components/templates/comment-cell-editor.html'
	}
}])
.directive('agGridAbsence', [ function() {
	return {
		restrict: 'E',
		scope:false,
		templateUrl: 'common/ag-grid-components/templates/absence-cell-editor.html'
	}
}])
.directive('agGridGuardExtras', [ function() {
	return {
		restrict: 'E',
		scope:false,
		templateUrl: 'common/ag-grid-components/templates/guard-extras-cell-editor.html'
	}
}])
.directive('agGridViewOperation', [ function() {
	return {
		restrict: 'E',
		scope: true,
		templateUrl: 'common/ag-grid-components/templates/view-operation.html',
		controller: ['$scope','$attrs', function($scope,$attrs) {
			$scope.opId = $attrs.opId;
		}]
	}
}])

// This attribute takes the function in the parent scope
// that is responsible for resizing agGrid and executes it
// every time de window changes it's size
.directive('agGridReload', [ function() {
	return {
		restrict: 'A',
		scope: false,
		link: function(scope, element, attrs) {
			var onResize = function(){
				scope[attrs['agGridReload']]();
			};
			angular.element(window).bind('resize', onResize);

			scope.$on('$destroy', function () {
				angular.element(window).off('resize', onResize);
			});
		}
	};
}]);