'use strict';

// var _ = require('lodash');
var AuthorizationContext = require('janux-authorize').AuthorizationContext;

module.exports = [
	    '$scope','permissionBits','groupsList','authService','$state',
function($scope , permissionBits , groupsList , authService , $state){

	// console.log('permissionBits', permissionBits);
	// console.log('groupsList', groupsList);

	$scope.permissionBits = permissionBits;
	$scope.contextName = '';
	$scope.contextDesc = '';
	$scope.contextGroupCode = groupsList[0].code;
	$scope.groupsList = groupsList;

	$scope.cancel = function () {
		window.history.back();
	};

	$scope.saveAuthContext = function () {
		if(!$scope.authContextForm.$invalid){
			if($scope.permissionBits.length > 0){
				var authContext = AuthorizationContext.createInstance($scope.contextName, $scope.contextDesc, $scope.permissionBits);

				authService.insertAuthorizationContext($scope.contextGroupCode, authContext.toJSON())
					.then(function () {
						$state.go('permissions.auth-contexts');
					});
			}else{
				console.error('Select at least one permission bit in order to create an authorization context');
			}
		}else {
			console.error('Please complete all required fields');
		}
	};

	$scope.addPermissionBit = function () {
		$scope.permissionBits.push('');
	};

	$scope.removeBit = function (index) {
		$scope.permissionBits.splice(index,1);
	};
}];