'use strict';

module.exports = 
       ['$dialog','$http','$location','$q','securityRetryQueue', 
function($dialog , $http , $location , $q, queue) {

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
			queue.retryAll();
		} else {
			console.debug("Closed the dialog under inauspicious circumstances");
			redirect();
		}
	}

	//
	// Register a handler for when an item is added to the retry queue
	// 
	// The handler in question, shows the login window if queue.hasMore()
	// Why is this necessary ?
	//
	queue.onItemAddedCallbacks.push(function(retryItem) {
		if ( queue.hasMore() ) {
			service.showLogin();
		}
	});

	//
	// The public API
	//
	var service = {

		//
		// Returns the 'reason' for why the auth operations fail, or 'undefined if no
		// reasons exist
		//
		getLoginReason: function() {
			return queue.retryReason();
			return true;
		},

		/** 
		 * Display the login modal
		 */
		showLogin: function() {
			openLoginDialog();
		},

		/**
		 * Authenticate the user with email and password
		 */
		login: function(email, password) {
			var request = $http.post('/login', {email: email, password: password});
			return request.then(function(response) {
				// console.debug("login resp:", JSON.stringify(response));
				service.currentUser = response.data.user;
				if ( service.isAuthenticated() ) {
					closeLoginDialog(true);
				}
				return service.isAuthenticated();
			});
		},

		//
		// Gives up on trying to login, clears the retry queue (?)
		// TODO-pp: if we are clearing the queue, should we not doing explicitly
		//
		cancelLogin: function() {
			closeLoginDialog(false);
			redirect();
		},

		logout: function(redirectTo) {
			$http.post('/logout').then(function(resp) {
				// console.debug("logout resp:", JSON.stringify(resp));
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