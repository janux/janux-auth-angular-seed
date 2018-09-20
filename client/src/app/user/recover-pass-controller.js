'use strict';

var _ = require('lodash');
var md5 = require('md5');

module.exports =
	['$scope','dialogService','userActionService','$mdToast','$filter','recovery','$state','userService','security','config','$translate','validationService',
		function ($scope , dialogService , userActionService , $mdToast , $filter , recovery , $state, userService , security , config , $translate, validationService) {

			var recObj = recovery;
			console.log('recovery', recObj);

			if (_.isNil(recovery)) {
				dialogService.info('user.dialogs.invalidCode');
			} else {
				var now = new Date();
				if (recObj.expire < now) {
					dialogService.info('user.dialogs.recoveryExpired');
					$state.go('login');
				}
				else if(recObj.status === 'completed') {
					dialogService.info('user.dialogs.recoveryPrevCompl');
					$state.go('login');
				}
				else {
					$scope.user = recObj.account;
					$scope.user.password = '';
					$scope.user.confirmPass = '';
				}
			}

			$scope.recover = function () {
				// Save recovery + account
				try {
					validationService.password($scope.user.password, $scope.user.confirmPass);
				} catch (err) {
					switch (err) {
						case 'notMatch':
							dialogService.info('user.dialogs.passConfMatch');
							return;
						case 'strength':
							dialogService.info('user.dialogs.passStrength');
							return;
					}
				}

				var username = $scope.user.username;
				var password = $scope.user.password;

				recObj.status = 'completed';
				recObj.account = $scope.user;
				recObj.account.password = md5(recObj.account.password);
				userActionService.update(recObj).then(function () {
					// Try to login
					security.login(username, password).then(function(loggedIn) {
						if ( !loggedIn ) {
							// If we get here then the login failed due to bad credentials
							$translate('login.error.invalidCredentials').then( function(msg) {
								$scope.authError = msg;
								$scope.authReason= null;
							});
						}
						else if ($state.current.name === 'recover') {
							$state.go(config.defaultState);
						}
					}, function() {
						// If we get here then there was a problem with the login request to the server
						$translate('login.error.serverError').then( function(msg) {
							$scope.authError = msg;
							$scope.authReason= null;
						});
					});
				});
			};
		}];
