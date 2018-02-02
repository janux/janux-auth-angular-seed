'use strict';

var _ = require('lodash');

module.exports = ['$scope','roles','$modal','$state','roleService','$mdToast',
	function($scope, roles, $modal, $state,roleService,$mdToast) {
	$scope.roles = _.sortBy(_.values(roles),'sortOrder');
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

	$scope.moveRole = function (index) {
		var rolesToSave = [];
		// Move role
		$scope.roles.splice(index, 1);
		// Update sort order
		$scope.roles.forEach(function(role, iRole){
			role.sortOrder = iRole;
			var roleToSave = {};
			roleToSave.id = role.id;
			roleToSave.sortOrder = role.sortOrder;
			rolesToSave.push(roleToSave);
		});

		roleService.updateSortOrder(rolesToSave).then(function (resp) {
			$mdToast.show(
				$mdToast.simple()
					.textContent('Role position successfully updated')
					.position( 'top right' )
					.hideDelay(3000)
			);
			console.log('Updated roles', resp);
		});
	};
}];