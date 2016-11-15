'use strict';
//
// pug
// compiles pug templates into html
//
var path = require('path'),
	gutil  = require('gulp-util');


module.exports = function(gulp) {
	var cfg = gulp.cfg;

	//
	// you can pass data that will be available in the templates here,
	// for example, a version number, or a dev/prod flag
	//
	cfg.pug.data = {
		cfg: cfg
	};
	
	gulp.task('pug', function() {
		gulp.src( 
			cfg.fileset.html, 
			{
				cwd:  cfg.dir.src,
				base: cfg.dir.src + path.sep
			}
		)
		.pipe(gulp.plugins.pug(cfg.pug)
			.on('error', function(err) { gutil.log(err)})) // don't interrupt gulp.watch
		.pipe(gulp.dest(cfg.dir.dist));
	});
};
