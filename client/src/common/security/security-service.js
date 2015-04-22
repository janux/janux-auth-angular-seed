'use strict';

var 
	_    = require('lodash'),
	Role = require('janux-security').Role
;

module.exports = 
       ['$modal','$http','$location','$q','retryQueue',
function($modal , $http , $location , $q , retryQueue) {

	function redirect(url) {
		url = url || '/';
		$location.path(url);
	}

	//
	// When a user is returned from the back-end, hydrate each 
	// role json structure into a full janux Role instance
	//
	function hydrateRoles(user) {
		if (user && user.account && user.account.roles) {
			user.account.roles = _.map(user.account.roles, function(role) {
				return Role.fromJSON(role);
			});
		}
		return user;
		// console.debug('user can READ WIDGET', service.currentUser.account.roles[0].can('READ','WIDGET'));
	}

	var loginDialog = null;

	function openLoginDialog() {
		if (loginDialog) {
			throw new Error('Trying to open login dialog that is already open!');
		}
		//TODO-pp: the 'static' here is undesirable, should be replaced with build variable, 
		//since this it is also dependent on the value to which we map static assets in express
		loginDialog = $modal.open({
			templateUrl: 'static/common/security/login/form.html', 
			controller:  'loginController',
			size: 'sm'
		});

		loginDialog.result.then(onLoginDialogClose);
	}

	function closeLoginDialog(success) {
		if (loginDialog) {
			loginDialog.close(success);
		}
	}

	function onLoginDialogClose(success) {
		loginDialog = null;
		if (success) {
			retryQueue.retryAll();
		} else {
			redirect();
		}
	}

	//
	// Register a handler for when an item is added to the retry queue
	// 
	// The handler in question, shows the login window if retryQueue.hasMore()
	// Why is this necessary ?
	//
	retryQueue.onItemAddedCallbacks.push(function(retryItem) {
		if ( retryQueue.hasMore() ) {
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
			return retryQueue.retryReason();
			return true;
		},

		/** 
		 * Display the login modal
		 */
		showLogin: function() {
			openLoginDialog();
		},

		/**
		 * Authenticate the user with username and password
		 */
		login: function(username, password) {
			var request = $http.post('/login', { username: username, password: password});
			return request.then(function(response) {
				console.debug('login resp:', JSON.stringify(response));
				service.currentUser = hydrateRoles(response.data.user);

				if ( service.isAuthenticated() ) {
					closeLoginDialog(true);
					// if we are logging in from the goodbye page, 
					// redirect to the dashboard
					if ($location.path() === '/goodbye') redirect('/');
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
			var redirectTo = redirectTo || '/goodbye';
			$http.post('/logout').then(function(resp) {
				// console.debug("logout resp:", JSON.stringify(resp));
				service.currentUser = null;
				redirect(redirectTo);
			});
		},

		requestCurrentUser: function() {
			if ( service.isAuthenticated() ) {
				console.log('currentUser-cached:', service.currentUser);
				return $q.when(service.currentUser);
			} else {
				return $http.get('/current-user').then(function(response) {
					service.currentUser = hydrateRoles(response.data.user);
					console.log('currentUser-served:', service.currentUser);
					return service.currentUser;
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
