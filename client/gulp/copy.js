'use strict';
//
// copies css, images, and javascript libs assets to distribution folder
//

var path = require('path');

module.exports = function(gulp) {
	var cfg = gulp.cfg;

	gulp.task('copy', function() {
		console.log('copying assets...');
		gulp.src(
			cfg.fileset.assets,
			{
				cwd:  cfg.dir.src,
				base: cfg.dir.src + path.sep
			}
		).pipe(gulp.dest(cfg.dir.dist));

		gulp.src(cfg.fileset.cssLibs)
		.pipe(gulp.dest(path.join(cfg.dir.dist, cfg.dir.css)));
	});

};
