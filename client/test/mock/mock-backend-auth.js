'use strict';

module.exports = 
//        ['$httpBackend','$log', 'authMock',
// function($httpBackend , $log ,  authMock) {
       ['$httpBackend','$log',
function($httpBackend , $log) {
	$httpBackend.whenGet('/current-user').respond(function() {
		return [200, widgeter, {}];
	});
}];

var widgeter = {
	account: {
		name: 'widget',
		password: 'test1',
		password_expire: '',
		is_locked: false,
		expire: '',
		roles: ['WIDGET_DESIGNER']
	},
	person: {
		name: {
			first: 'Chase',
			last: 'Widgeter'
		}
	}
}

