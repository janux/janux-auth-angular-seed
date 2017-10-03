'use strict';

module.exports = [
'$scope','authContextGroups','authContextService','$state','$modal', function(
 $scope , authContextGroups , authContextService , $state , $modal) {

	$scope.authContextGroups = authContextGroups;
	// console.log('authContextGroups', authContextGroups);

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
}];