'use strict';

var
	_    = require('lodash'),
	Role = require('janux-authorize').Role,
	Person = require('janux-people').Person;
;

module.exports =
       ['$modal','$http','$location','$q','retryQueue','$state', 'localStorageService', 'jwtHelper','$rootScope',
function($modal , $http , $location , $q , retryQueue , $state, localStorageService, jwtHelper, $rootScope) {

	function redirect(url) {
		url = url || '/';
		$location.path(url);
	}

	//
	// When a user is returned from the back-end, hydrate each
	// role json structure into a full janux Role instance
	//
	function hydrateRoles(user) {
		if (user && user.roles) {
			user.roles = _.map(user.roles, function(role) {
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
		loginDialog = $modal.open({
			templateUrl: 'common/security/login/form.html',
			controller:  'loginController',
			size: 'sm'
		});

		loginDialog.result.then(onLoginDialogClose)
		// handles dismissing modal dialog by clicking in backdrop
		.catch(function() {
			onLoginDialogClose(false);
		});
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
			// redirect();
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
			// openLoginDialog();
			$state.go('login');
		},

		/**
		 * Authenticate the user with username and password
		 */
		login: function(username, password) {
			var request = $http.post('/login', { username: username, password: password});
			return request.then(function(response) {
				var user = response.data.user;
				console.debug('login resp:', JSON.stringify(response));

				if(user){
					service.currentUser = hydrateRoles(response.data.user);
					service.currentUser.contact = Person.fromJSON(service.currentUser.contact);
					service.token = response.data.token;
					// Save the token in local storage.
					localStorageService.set('token', service.token);
				}

				if ( service.isAuthenticated() ) {
					$rootScope.$broadcast('AppLogIn', service.currentUser);
					closeLoginDialog(true);
					// if we are logging in from the goodbye page,
					// redirect to the dashboard
					// if ($location.path() === '/goodbye') redirect('/');
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
			// redirect();
		},

		logout: function(redirectTo) {
			var redirectTo = redirectTo || 'login';
			$http.post('/logout').then(function(resp) {
				// console.debug("logout resp:", JSON.stringify(resp));
				service.currentUser = null;
				localStorageService.remove("token");
				$state.go(redirectTo, {goodbye:"TRUE"});
			});
		},

		forceLogout: function () {
			service.currentUser = null;
			localStorageService.remove("token");
		},

		requestCurrentUser: function() {
			if ( service.isAuthenticated() ) {
				console.log('currentUser-cached:', service.currentUser);
				$rootScope.$emit('currentUserCached', service.currentUser);
				return $q.when(service.currentUser);
			} else {
				return $http.get('/current-user').then(function(response) {
					service.currentUser = hydrateRoles(response.data.user);
					if(typeof response.data.user !== 'undefined'){
						service.currentUser.contact = Person.fromJSON(response.data.user.contact);
					}
					console.log('currentUser-served:', service.currentUser);
					return service.currentUser;
				});
			}
		},

		currentUser: null,

		isAuthenticated: function() {
			//Validate if there is a token
			var token = localStorageService.get("token");
			if( _.isNil(service.currentUser) && _.isNil(token)===false) {
				if(jwtHelper.isTokenExpired(token) === false){
					var tokenPayload = jwtHelper.decodeToken(token);
					service.currentUser =  hydrateRoles(tokenPayload);
					//TODO do from json to company also
					service.currentUser.contact = Person.fromJSON(service.currentUser.contact);
					console.log("Token decoded");
				}
			}
			return !_.isNil(service.currentUser);
		}
	};

	return service;
}];
