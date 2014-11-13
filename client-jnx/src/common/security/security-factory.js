'use strict';

var out = ['$http','$q', 
function(   $http,  $q) {

	//
	// The public API
	//
	var service = {

		showLogin: function() {
			console.log('clicked on Login');
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

module.exports = out;
