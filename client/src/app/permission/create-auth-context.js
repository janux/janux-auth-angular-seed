'use strict';

var _ = require('lodash');
// var AuthorizationContext = require('janux-security').AuthorizationContext;

module.exports = [
	    '$scope','permissionBits',
function($scope, permissionBits){
	console.log('permissionBits', permissionBits);

	// $scope.permissionBits = permissionBits;
	$scope.permissionBits = [];
	$scope.selPermBits = {};
	$scope.contextName = '';
	$scope.contextDesc = '';

	permissionBits.forEach( function(bit) {
		$scope.selPermBits[bit] = true;
	});

	$scope.createAuthContext = function () {

		var selBits = _.map($scope.selPermBits, function (bit, key) {
			if(bit === true){
				return key;
			}
		});

		if(selBits.length > 0){
			// var authContext = AuthorizationContext.createInstance($scope.contextName, $scope.contextDesc, selBits);

			// TODO: Implement functionality to save an authorization context
		}else{
			console.error('Select at least one permission bit in order to create an authorization context');
		}
	};

	$scope.addPermissionBit = function () {
		$scope.permissionBits.push({
			bitName: '',
			description: ''
		});
	};
}];