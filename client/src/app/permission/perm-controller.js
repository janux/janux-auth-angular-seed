'use strict';

module.exports = [
'$scope','authContextGroups','authContextService','$state','$modal', function(
 $scope , authContextGroups , authContextService , $state , $modal) {

	$scope.authContextGroups = authContextGroups;
	// console.log('authContextGroups', authContextGroups);

	//
	// Delete authorization context
	var deleteAuthContext = function (groupCode, name) {
		return 	authContextService.deleteByName(groupCode, name)
			.then(function () {
				$state.go($state.current, {}, {reload: true});
			});
	};

	var deleteContextCtrl = ['$scope','$modalInstance', 'data',
					function($scope , $modalInstance, data) {
		$scope.targetDescr = 'Authorization Context: '+data.name;

		$scope.ok = function() {
			deleteAuthContext(data.groupCode, data.name);
			$modalInstance.close();
		};

		$scope.cancel = function() {
			$modalInstance.dismiss();
		};
	}];

	$scope.openDeleteAuthContextDialog = function(groupCode, name){
		$modal.open({
			templateUrl: 'app/dialog-tpl/delete-dialog.html',
			controller: deleteContextCtrl,
			size: 'md',
			resolve: {
				data: function () {
					return { groupCode:groupCode, name:name };
				}
			}
		});
	};

	//
	// Delete authorization context group

	var deleteContextGroupCtrl = ['$scope','$modalInstance', 'group',
		function($scope , $modalInstance, group) {
			$scope.targetDescr = 'Authorization Context Group: '+group.name;

			$scope.ok = function() {
				return 	authContextService.removeGroup(group.code)
					.then(function () {
						$modalInstance.close();
						$state.go($state.current, {}, {reload: true});
					});
			};

			$scope.cancel = function() {
				$modalInstance.dismiss();
			};
		}];

	$scope.openDeleteAuthContextGroupDialog = function(group){

		// Can't delete the group because it still contains linked authorization contexts
		if(group.values.length) {
			$modal.open({
				templateUrl: 'app/dialog-tpl/info-dialog.html',
				controller: ['$scope','$modalInstance',
					function($scope , $modalInstance) {
						$scope.message = 'You can not delete this group because it contains '+group.values.length+' linked authorization contexts';

						$scope.ok = function() {
							$modalInstance.close();
						};
					}],
				size: 'md'
			});
		} else {
			$modal.open({
				templateUrl: 'app/dialog-tpl/delete-dialog.html',
				controller: deleteContextGroupCtrl,
				size: 'md',
				resolve: {
					group: function () {
						return group;
					}
				}
			});
		}
	};
}];