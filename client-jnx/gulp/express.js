'use strict';
//
// starts and reloads an express server
//
var _ = require('lodash');

module.exports = function(gulp) {
	var cfg = gulp.cfg;

	// runs a connect dev server, without reloading
	gulp.task('express', function() {gulp.plugins.express.run(cfg.server)});

	// alias for 'express'
	// in the case of express, the livereloading is controlled by the parameter
	// 'cfg.server.reload' in config/default.js, rather than by invoking a
	// specific gulp task (because we have not devised a way to pass a parameter
	// in the build to server/server.js as to whether or not to start in reload
	// mode)
	gulp.task('express-reload', ['express']);
};
