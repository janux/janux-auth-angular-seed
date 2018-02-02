'use strict';

var _ = require('lodash');
var util = require('../../common/security/util');

module.exports = [
'$scope','authContextGroups','authContextService','$state','$modal','$mdToast', function(
 $scope , authContextGroups , authContextService , $state , $modal , $mdToast) {

	// Ensure order of groups
	$scope.authContextGroups = _.sortBy(authContextGroups, function (group) {
		group.values = _.sortBy(group.values, 'sortOrder');
		return (!group.attributes.sortOrder)?0:group.attributes.sortOrder;
	});
	console.log('authContextGroups', authContextGroups);

	$scope.listTypes = {
		authContextGroup: ['authContextGroup'],
		authContext: ['authContext']
	};

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

	$scope.moveGroup = function (index) {
		var groupsOrder = [];

		$scope.authContextGroups.splice(index, 1);
		$scope.authContextGroups.forEach(function (group, iGroup) {
			group.attributes = { sortOrder: ''+iGroup };
			var groupToSave = {};
			groupToSave.code = group.code;
			groupToSave.attributes = group.attributes;
			groupsOrder.push(groupToSave);
		});

		authContextService.updateGroupsSortOrder(groupsOrder).then(function (resp) {
			$mdToast.show(
				$mdToast.simple()
					.textContent('Group position successfully updated')
					.position( 'top right' )
					.hideDelay(3000)
			);
			console.log('Updated groups order', resp);
		});
	};

	$scope.moveAuthContext = function (authContextGroup, index) {
		var promises = [];
		var groupToWork, authContextsOrder = [];
		var authContext = authContextGroup.values[index];

		// Move the context
		authContextGroup.values.splice(index, 1);

		// Check if the context has fallen into another group
		if(!_.find(authContextGroup.values, {name: authContext.name})){
			var newGroup = _.find($scope.authContextGroups,function (group) {
				return _.find(group.values, {name: authContext.name});
			});
			groupToWork = newGroup;

			// Ensure auth context order
			authContext.sortOrder = _.findIndex(groupToWork.values, {name:authContext.name});
			promises.push(authContextService.update(authContext.name,groupToWork.code,authContext));
		} else {
			groupToWork = authContextGroup;
		}

		// Sort authorization contexts
		groupToWork.values.forEach(function(authContext, iContext){
			var contextToSave = {};
			contextToSave.name = authContext.name;
			contextToSave.sortOrder = iContext;
			authContextsOrder.push(contextToSave);
		});

		console.log('Sorted auth context group', authContextsOrder);

		promises.push(authContextService.updateSortOrder(authContextsOrder));

		Promise.all(promises).then(function(resp){
			$mdToast.show(
				$mdToast.simple()
					.textContent('Authorization context position successfully updated')
					.position( 'top right' )
					.hideDelay(3000)
			);
			console.log('Updated authorization context', resp);
		});
	};

	// Convert object of authorization bits to array
	$scope.authCBitsToArray = util.authCBitsToArray;
}];
