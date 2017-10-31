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
					size: 'md'
				});

				e.preventDefault();
				e.stopPropagation();
			});
		}
	}
}]);