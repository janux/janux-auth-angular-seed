'use strict';

// var _ = require('lodash');
// var AuthorizationContext = require('janux-authorize').AuthorizationContext;

module.exports = [
	    '$scope','permissionBits',
function($scope, permissionBits){

	console.log('permissionBits', permissionBits);

	$scope.permissionBits = permissionBits;
	$scope.contextName = '';
	$scope.contextDesc = '';
	$scope.contextGroup = '';

	$scope.cancel = function () {
		window.history.back();
	};

	$scope.createAuthContext = function () {

		if(!$scope.authContextForm.$invalid){
			if($scope.permissionBits.length > 0){
				// var authContext = AuthorizationContext.createInstance($scope.contextName, $scope.contextDesc, selBits);

				// TODO: Implement functionality to save an authorization context
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