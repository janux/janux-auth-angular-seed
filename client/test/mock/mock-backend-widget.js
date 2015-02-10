'use strict';

module.exports = 
//        ['$httpBackend','$log', 'authMock',
// function($httpBackend , $log ,  authMock) {
       ['$httpBackend','$log',
function($httpBackend , $log) {
	$httpBackend.whenGet('/widget').respond(function() {
		return [200, widget, {}];
	});
}];

var widget = {
	name: 'Widget 2014',
	description: 'Fastest Widget in the West'
}

