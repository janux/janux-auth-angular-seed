'use strict';
//
// lints javascript files
//

var	path = require('path'),
	karma  = require('karma').server;

module.exports = function(gulp) {
	var cfg = gulp.cfg;
	
	gulp.task('test:run', function(done) {
		// console.log('running tests with karma... in', __dirname);
		karma.start({
			configFile: path.join(__dirname, '..',cfg.dir.test, cfg.file.karma),
		}, done);

		/*
		gulp.src('dummy')
			.pipe(gulp.plugins.karma({
				configFile: path.join(cfg.dir.test, cfg.file.karma),
				action:     'run'
			})).on('error', function(err) {
				// error interrupts processing
				throw err;
			});
		*/
	});
};
