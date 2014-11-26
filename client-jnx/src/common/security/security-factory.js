'use strict';

module.exports = 
       ['$dialog','$http','$q', 
function($dialog , $http , $q) {

	var loginDialog = null;
	function openLoginDialog() {
		if ( loginDialog ) {
			throw new Error('Trying to open login dialog that is already open!');
		}
		loginDialog = $dialog.dialog();
		//TODO-pp: the 'static' here is undesirable, should be replaced with build variable, 
		//since this it is also dependent on the value to which we map static assets in express
		loginDialog.open('static/common/security/login/form.html', 'LoginFormController').then(onLoginDialogClose)
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

		showLogin: function() {
			console.log('clicked on Login');
			openLoginDialog();
		},

		logout: function() {
			console.log('clicked on Logout');
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

		/*
		currentUser: { 
			name: 'quietsky',
			firstName: 'Philippe',
			lastName: 'Paravicini'
		},
		*/

		isAuthenticated: function() {
			return !!service.currentUser;
		}
	};

	return service;
}];
