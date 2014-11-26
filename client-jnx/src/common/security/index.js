'use strict';

require('ui-bootstrap-modal');

require('angular').module('security', ['ui.bootstrap.dialog'])
	.factory(   'security',            require('./security-factory.js'))
	.directive( 'loginToolbar',        require('./login/toolbar.js'))
	.controller('LoginFormController', require('./login/login-form-controller.js'))
