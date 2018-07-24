'use strict';

module.exports = function (translateKey, $modal, $filter) {
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
