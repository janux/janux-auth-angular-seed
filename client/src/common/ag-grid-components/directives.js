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
.directive('agGridStaffAutocomplete', [ function() {
	return {
		restrict: 'E',
		scope:false,
		templateUrl: 'common/ag-grid-components/templates/autocomplete-staff-cell-editor.html',
		controller: ['$scope','$attrs', function($scope,$attrs) {
			var resource = $scope[$attrs.selectedValueModel].resource;
			$scope.valueAutoStaff = ''; // $scope[$attrs.selectedValueModel];
			$scope.valueAutoStaffPlaceholder = resource.name.last+' '+resource.name.first;
			$scope.autoStaffSelectedItem = '';
			// $scope.driversAndOps comes form parent controller
			$scope.agGridOperationDrivers = $scope.driversAndOps.drivers;

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
					$scope.$broadcast('agGridSelectedOpChange', item);

				} else {
					// This means that the entered search text is empty or doesn't match any staff member
				}
			};

			function createFilterForStaff(query) {
				return function filterFn(operationDriver) {
					var driver = operationDriver.resource;
					var name = driver.name.last+' '+driver.name.first;
					var index = name.toLowerCase().indexOf(angular.lowercase(query));
					return (index === 0);
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
					var index = operation.name.toLowerCase().indexOf(angular.lowercase(query));
					return (index === 0);
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
}]);