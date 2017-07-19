'use strict';

require('angular-translate-loader-static-files');

//
// The loginController provides the behaviour behind a reusable form to allow users to authenticate.
// This controller and its template (login/form.tpl.html) are used in a modal dialog box by the security service.
// 
module.exports =
       ['$scope','security','$translate','$state','config','$stateParams',
function($scope , security , $translate , $state , config , $stateParams) {
	// The model for this form 
	$scope.user = {
		account: {},
		person:  {}
	};

	// Any error message from failing to login
	$scope.authError = null;

	// The reason that we are being asked to login - for instance because we tried
	// to access something to which we are not authorized We could do something
	// different for each reason here but to keep it simple...
	// 
	// TODO-pp: check whether this is actually used anywhere; for the time being,
	// it's a good example of translating multiple items at once
	//
	$scope.authReason = null;
	if ( security.getLoginReason() ) {

		$translate(['login.msg.notAuthorized', 'login.msg.notAuthenticated'])
			.then( function(translated) {
				$scope.authReason = ( security.isAuthenticated() ) ?
					translated['login.msg.notAuthorized'] :
					translated['login.msg.notAuthenticated'];
		})
	}

	if($stateParams.goodbye) {
		$translate('login.msg.goodbye').then( function(msg) {
			$scope.authReason = msg;
		});
	}

	// Attempt to authenticate the user specified in the form's model
	$scope.login = function() {
		console.log('login controller');
		// Clear any previous security errors
		$scope.authError = null;

		// Try to login
		security.login($scope.user.account.name, $scope.user.account.password).then(function(loggedIn) {
			if ( !loggedIn ) {
				// If we get here then the login failed due to bad credentials
				$translate('login.error.invalidCredentials').then( function(msg) {
					$scope.authError = msg;
					$scope.authReason= null;
				});
			}
			else if ($state.current.name === 'login') {
				$state.go(config.defaultState);
			}
		}, function(err) {
			// If we get here then there was a problem with the login request to the server
			$translate('login.error.serverError').then( function(msg) {
				$scope.authError = msg;
				$scope.authReason= null;
			});

			// If we want to interpolate a variable:
			//	
			// $translate('login.error.serverErrorOutput', {parm1: err}).then( function(msg) {
			//	$scope.authError = msg;
			// });
		});
	};

	$scope.clearForm = function() {
		$scope.user = {};
	};

	$scope.cancelLogin = function() {
		security.cancelLogin();
	};
}];
