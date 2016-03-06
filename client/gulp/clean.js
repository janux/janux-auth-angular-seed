//
// Clean
//
var path = require('path');
	del = require('del');

module.exports = function(gulp) {
	
	gulp.task('clean', function () {
		return del([
			path.join(gulp.cfg.dir.dist,'*')
		]);
	});

};

