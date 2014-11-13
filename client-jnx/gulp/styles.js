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

		var recessOpts = {
			includePath: [cfg.dir.bower] // search for imports here
			//
			// Uncomment these options if you want recess to issue less warnings;
			// in particular, the strictPropertyOrder is a twitter convention that can
			// be quite verbose if applied to a stylesheet that was not authored with
			// this convention
			//
			,strictPropertyOrder:  false  // do not complain about properties out of order
			// ,noOverqualifying:     false // do not complain about overqualifying selectors div#foo.bar
			// ,zeroUnits:            false // do not complain about adding units to values of 0
			// ,noUniversalSelectors: false // do not complain about using the universal * selector
		};

		gulp.src(
			cfg.fileset.less,
			{
				cwd:  path.join(cfg.dir.src, cfg.dir.css),
				base: cfg.dir.src + path.sep
			})
			.pipe(gulp.plugins.less(lessOpts).on('error', console.log))
			.pipe(gulp.plugins.recess(recessOpts).on('error', function(err) {console.log(err)}))
			.pipe(gulp.plugins.autoprefixer('last 1 version'))

			// name destination file with the 'name' attribute in the package.json file
			// .pipe(gulp.plugins.concat(cfg.pkg.name + '.css'))

			.pipe(gulp.dest(cfg.dir.dist))
			.pipe(gulp.plugins.size());
	});
};
