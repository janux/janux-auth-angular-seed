//
// Clean
//
var path = require('path');

module.exports = function(gulp) {
	
	gulp.task('clean', function () {
		return gulp.src([
			path.join(gulp.cfg.dir.dist,'*')
		], {read: false})
		.pipe(gulp.plugins.rimraf());
	});

};

