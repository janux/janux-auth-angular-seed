'use strict';
//
// lints javascript files
//

var	path     = require('path'),
	browserify = require('browserify'),
	source     = require('vinyl-source-stream');


module.exports = function(gulp) {
	var cfg = gulp.cfg;
	
	gulp.task('scripts', function() {
		console.log('linting js files...');
		gulp.src(cfg.fileset.js)
			.pipe(gulp.plugins.jshint(cfg.jshint.rcfile))
			.pipe(gulp.plugins.jshint.reporter(cfg.jshint.reporter));
	});

	var appFile = '.' + path.sep + path.join(cfg.dir.src, cfg.dir.js, cfg.file.app);

	gulp.task('browserify', function() {
		console.log('bundling app...');
		browserify(appFile)
			.bundle()
			.pipe(source(cfg.file.app))
			.pipe(gulp.dest(cfg.dir.dist));
	});
};
