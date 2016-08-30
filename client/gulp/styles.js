'use strict';
//
// styles2
//

var path = require('path');

module.exports = function(gulp) {
	var cfg = gulp.cfg;

	gulp.task('styles', function() {

		var lessOpts = {
			paths: [cfg.dir.bower] // search for imports here
		};

		gulp.src(
			cfg.fileset.less,
			{
				cwd:  path.join(cfg.dir.src, cfg.dir.css),
				base: cfg.dir.src + path.sep
			})
			.pipe(gulp.plugins.less(lessOpts).on('error', console.log))
			.pipe(gulp.plugins.autoprefixer('last 1 version'))

			// name destination file with the 'name' attribute in the package.json file
			// .pipe(gulp.plugins.concat(cfg.pkg.name + '.css'))

			.pipe(gulp.dest(cfg.dir.dist))
			.pipe(gulp.plugins.size());
	});
};
