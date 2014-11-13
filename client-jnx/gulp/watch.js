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

	gulp.task('watch',['build','connect-reload'], function () {

		// Watch for changes that change during dev
		gulp.watch(cfg.fileset.watch, {debounceDelay: 250}, function(event) {
			// console.log('watch triggered:', event );
			gulp.src(path.join(cfg.dir.dist,'*.html')).pipe(gulp.plugins.connect.reload());
		});

		// gulp.watch( 'dist/**/*', function(event) {
		//		console.log('event: ', event);
		// });
		
		// Watch .less files
		gulp.watch( cfg.fileset.lessSrc, ['styles']);

		gulp.watch( cfg.fileset.jade, ['jade']);

		// Watch .js files
		// gulp.watch('app/scripts/**/*.js', ['scripts']);
		// TODO: add two entries for 'app' and 'common' folders rather than going
		// through all the folders under 'src'
		gulp.watch([ 
			path.join(cfg.dir.src, '**','*.js')
		], ['scripts','browserify']);

		// Watch image files
		// gulp.watch('app/images/**/*', ['images']);
		// gulp.watch( cfg.dir.img + '/**/*', ['images']);
	});
}
