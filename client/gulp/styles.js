'use strict';
//
// styles2
//

var path = require('path'),
    argv = require('yargs').argv,
    gutil = require('gulp-util');

module.exports = function (gulp) {
    var cfg = gulp.cfg;

    gulp.task('styles', function () {

        var lessOpts = {
            paths: [cfg.dir.bower], // search for imports here
            plugins: [require('less-plugin-glob')] // use ** and * in import statements
        };

        gulp.src(
            cfg.fileset.less,
            {
                cwd: path.join(cfg.dir.src, cfg.dir.css),
                base: cfg.dir.src + path.sep
            })
            .pipe(gulp.plugins.less(lessOpts)
                .on('error', function (err) {
                    console.log(err);
                    var isProduction = (argv.prod !== undefined);
                    if (isProduction === true) {
                        gutil.log(err);
                        console.log("Throwing bad error");

                        // For some reason. If the code trows an error.
                        // less, gulp-less or something else catches the error
                        // and remove it. Making the gulp task return a 0 value,
                        // indicating that everything went fine.

                        //The only solution for the moment is to force a crash.

                        process.exit(1);
                    }
                }))
            .pipe(gulp.plugins.autoprefixer('last 1 version'))

            // name destination file with the 'name' attribute in the package.json file
            // .pipe(gulp.plugins.concat(cfg.pkg.name + '.css'))

            .pipe(gulp.dest(cfg.dir.dist))
            .pipe(gulp.plugins.size());
    });
};
