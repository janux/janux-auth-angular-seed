'use strict';

var _ = require('lodash');

module.exports = ['$scope','roles','$modal','$state','roleService',
	function($scope, roles, $modal, $state,roleService) {
	$scope.roles = _.values(roles);
	// console.log('Loaded roles', $scope.roles);

	//
	// Delete authorization context
	var deleteRole = function (name) {
		return 	roleService.deleteByName(name)
			.then(function () {
				$state.go($state.current, {}, {reload: true});
			});
	};

	var deleteRoleCtrl = ['$scope','$modalInstance', 'name',
		function($scope , $modalInstance, name) {
			$scope.targetDescr = 'Role: '+name;

			$scope.ok = function() {
				deleteRole(name);
				$modalInstance.close();
			};

			$scope.cancel = function() {
				$modalInstance.dismiss();
			};
		}];

	$scope.openDeleteRoleDialog = function(name){
		$modal.open({
			templateUrl: 'app/dialog-tpl/delete-dialog.html',
			controller: deleteRoleCtrl,
			size: 'md',
			resolve: {
				name: function () { return name; }
			}
		});
	};
}];