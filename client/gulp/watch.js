'use strict';
//
// Watch
//

var path = require('path');

module.exports = function(gulp) {
	
	var cfg = gulp.cfg;

	gulp.task('watch:clean', ['clean'], function() {
		gulp.start('watch');
	});

	gulp.task('watch',['build', 'serve-reload'], function () {

		// gulp.start('server-reload');

		// Watch for changes that change during dev
		gulp.watch(cfg.fileset.watch, {debounceDelay: 1000}, function(event) {
			// console.log('watch triggered:', event );

			// Assuming a single page-app, always reload the index page
			event.path = path.join(cfg.dir.dist, 'index.html');

			// ensure all processing is done before reloading
			setTimeout(function() {
				gulp.plugins.express.notify(event);
			},
			250);
		});

		
		// Watch .less files
		gulp.watch( cfg.fileset.lessSrc, ['styles']);

		gulp.watch( cfg.fileset.pug, ['pug']);

		// Watch .js files
		// TODO: add two entries for 'app' and 'common' folders rather than going
		// through all the folders under 'src'
		gulp.watch([ 
			path.join(cfg.dir.src, '**','*.js')
		], ['lint','browserify']);

		// Watch assets
		// TODO: apply this to all assets
		gulp.watch(path.join(cfg.dir.src, cfg.dir.locale, '*.json'), ['copy']);
		// gulp.watch( cfg.dir.img + '/**/*', ['images']);
	});
}
