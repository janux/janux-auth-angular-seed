'use strict';

module.exports = 
       ['$dialog','$http','$location','$q', 
function($dialog , $http , $location , $q) {

	function redirect(url) {
		url = url || '/';
		$location.path(url);
	}

	var loginDialog = null;

	function openLoginDialog() {
		if (loginDialog) {
			throw new Error('Trying to open login dialog that is already open!');
		}
		loginDialog = $dialog.dialog();
		//TODO-pp: the 'static' here is undesirable, should be replaced with build variable, 
		//since this it is also dependent on the value to which we map static assets in express
		loginDialog.open('static/common/security/login/form.html', 'LoginFormController').then(onLoginDialogClose)
	}

	function closeLoginDialog(success) {
		if (loginDialog) {
			loginDialog.close(success);
		}
	}

	function onLoginDialogClose(success) {
		loginDialog = null;
		if (success) {
			console.debug("Successfully closed the dialog");
			// queue.retryAll();
		} else {
			console.debug("Closed the dialog under inauspicious circumstances");
			// redirect();
		}
	}

	//
	// The public API
	//
	var service = {

		//TODO-pp: does this return a boolean or a string?
		getLoginReason: function() {
			// return queue.retryReason();
			return true;
		},

		/** 
		 * Display the login modal
		 */
		showLogin: function() {
			console.log('clicked on Login');
			openLoginDialog();
		},

		/**
		 * Authenticate the user with email and password
		 */
		login: function(email, password) {
			var request = $http.post('/login', {email: email, password: password});
			return request.then(function(response) {
				console.debug("login resp:", JSON.stringify(response));
				service.currentUser = response.data.user;
				if ( service.isAuthenticated() ) {
					closeLoginDialog(true);
				}
				return service.isAuthenticated();
			});
		},

		cancelLogin: function() {
			closeLoginDialog(false);
			redirect();
		},

		logout: function(redirectTo) {
			$http.post('/logout').then(function(resp) {
				console.debug("logout resp:", JSON.stringify(resp));
				service.currentUser = null;
				redirect(redirectTo);
			});
		},

		requestCurrentUser: function() {
			if ( service.isAuthenticated() ) {
				return $q.when(service.currentUser);
			} else {
				return $http.get('/current-user').then(function(response) {
					service.currentUser = response.data.user;
					return service.currentService;
				});
			}
		},

		currentUser: null,

		isAuthenticated: function() {
			return !!service.currentUser;
		}
	};

	return service;
}];
