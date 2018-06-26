'use strict';

var _ = require('lodash');
var AuthorizationContext = require('janux-authorize').AuthorizationContext;
var util = require('../../common/security/util');

module.exports = [
	'$scope','groupsList','authContextService','$state',
	function($scope , groupsList , authContextService , $state){

		// console.log('groupsList', groupsList);

		$scope.permissionBits = [{
			'label':'','position': 0
		}];
		$scope.contextName = '';
		$scope.contextDesc = '';
		$scope.contextGroupCode = groupsList[0].code;
		$scope.groupsList = groupsList;
		$scope.creating = true;

		// Convert object of authorization bits to array
		$scope.authCBitsToArray = util.authCBitsToArray;

		$scope.cancel = function () {
			window.history.back();
		};

		$scope.saveAuthContext = function () {
			var bitListSortedByPosition = $scope.permissionBits.sort(function (a,b) {
				return a.position>b.position;
			}).map(function (bit) {
				return bit.label;
			});

			if(!$scope.authContextForm.$invalid){
				if($scope.permissionBits.length > 0){
					var authContext = AuthorizationContext.createInstance($scope.contextName, $scope.contextDesc, bitListSortedByPosition);

					authContextService.insert($scope.contextGroupCode, authContext.toJSON())
						.then(function () {
							$state.go('permissions.authauthcontexts');
						});
				}else{
					console.error('Select at least one permission bit in order to create an authorization context');
				}
			}else {
				console.error('Please complete all required fields');
			}
		};

		$scope.addPermissionBit = function () {

			var maxPosition = ($scope.permissionBits.length>0)?_.maxBy($scope.permissionBits, function(bit){ return bit.position; }).position+1:0;
			$scope.permissionBits.push({
				'label':'','position': maxPosition
			});
		};

		$scope.removeBit = function (index) {
			$scope.permissionBits.splice(index,1);
		};
	}];