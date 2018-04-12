'use strict';


module.exports = [
'$scope', 'staff','$state','$q','$filter','$modal','partyService',
	function ($scope, staff, $state, $q, $filter, $modal , partyService) {
	console.log('staff list', staff);
	$scope.staffList = staff;

	var infoDialog = function(translateKey){
		$modal.open({
			templateUrl: 'app/dialog-tpl/info-dialog.html',
			controller: ['$scope','$modalInstance',
				function($scope , $modalInstance) {
					$scope.message= $filter('translate')(translateKey);

					$scope.ok = function() {
						$modalInstance.close();
					};
				}],
			size: 'md'
		});
	};

	$scope.openDelete = function(){
		var selectedIds = [];
		for (var i = 0; i<$scope.staffList.length; i++) {
			if($scope.staffList[i].Selected){
				var partyId = $scope.staffList[i].id;
				selectedIds.push(partyId);
			}
		}

		if(selectedIds.length>0) {
			$modal.open({
				templateUrl: 'app/dialog-tpl/confirm-dialog.html',
				controller: ['$scope','$modalInstance','$filter',
					function($scope , $modalInstance, $filter) {
						$scope.message= $filter('translate')('party.dialogs.confirmDeletion');

						$scope.ok = function() {
							var partyDeletionArray =[];

							for (var i = 0; i<selectedIds.length; i++) {
								console.log(selectedIds[i]);
								partyDeletionArray.push(partyService.remove(selectedIds[i]));
							}
							$q.all(partyDeletionArray).then(function(){
								$state.go($state.current, {}, {reload: true});
							});

							$modalInstance.close();
						};

						$scope.cancel = function() {
							$modalInstance.close();
						};
					}],
				size: 'md'
			});
		}else{
			infoDialog('party.dialogs.noRowSelectedError');
		}
	};
}];