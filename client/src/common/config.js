'use strict';

require('angular').module('config', [])
	.value('config', {
		// the state on which we should land by default, or upon login
		defaultState: 'logbook'
	});
