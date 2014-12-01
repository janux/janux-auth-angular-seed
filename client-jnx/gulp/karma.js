'use strict';
//
// lints javascript files
//

var	path = require('path'),
	karma  = require('browserify');

module.exports = function(gulp) {
	var cfg = gulp.cfg;
	
	gulp.task('test:run', function() {
		console.log('running tests with karma...');
		gulp.src('dummy')
			.pipe(gulp.plugins.karma({
				configFile: path.join(cfg.dir.test, cfg.file.karma),
				action:     'run'
			})).on('error', function(err) {
				// error interrupts processing
				throw err;
			});
	});
};
