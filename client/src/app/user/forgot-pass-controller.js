'use strict';

var _ = require('lodash');

module.exports = ['$scope','dialogService','userInvService','userService','$mdToast','$filter','$state','$timeout',
	function ($scope,dialogService, userInvService, userService, $mdToast, $filter , $state , $timeout) {
	$scope.searchToRecover = '';

	$scope.recover = function () {
		var recoverEmail = '';

		if (!$scope.recoverForm.$invalid) {
			// Search
			userService.findOneByUsernameOrEmail($scope.searchToRecover).then(function (userFound) {
				console.log('user found', userFound);
				// Get Email in order to create invitation
				if(!_.isNil(userFound)) {
					console.log('findUserByUserName', userFound);
					var emails = userFound.contact.emailAddresses(false);
					if (!_.isNil(emails) && emails.length > 0) {
						// console.log('user found emails', emails);
						_.every(emails, function (email) {
							// TODO: Validate if it is a real email address
							if(email.address !== '') {
								// Register recovery
								recoverEmail = email.address;
								userInvService.recoverPassword(userFound.userId, userFound.contact.id, recoverEmail).then(function(resp) {
									$mdToast.show(
										$mdToast.simple()
											.textContent($filter('translate')('staff.dialogs.invSent'))
											.position( 'top right' )
											.hideDelay(3000)
									);
									$timeout(function () {
										$state.go('login');
									}, 3000);
									console.log('Password recovery started', resp);
								});
								return false;
							}
						});
					} else {
						dialogService.info('login.dialogs.recoverEmailNotFound');
					}
				} else {
					dialogService.info('login.dialogs.usernameNotFound');
				}
			});
		} else {
			dialogService.info('');
		}
	};
}];
