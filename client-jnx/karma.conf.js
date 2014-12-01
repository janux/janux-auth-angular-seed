var cfg = require('config'),
	path  = require('path');

// replaces literal 'dist/**/*.html' = ['ng-html2js']
// in preprocessors section further below
var preprocessors = {};
preprocessors[path.join(cfg.dir.dist,'**','*.html')] = ['ng-html2js'];

module.exports = function(karma) {
  karma.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser;
		// the order of this list is important, load dependencies first
    files: [
			path.join(cfg.dir.bower,'jquery','dist','jquery.min.js'),
      path.join(cfg.dir.dist, cfg.file.app),
			path.join(cfg.dir.dist,'**','*.html'),
			path.join(cfg.dir.bower,'angular-mocks','angular-mocks.js'),
      path.join(cfg.dir.test,'**','*.spec.js')
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: preprocessors,

		ngHtml2JsPreprocessor: {
			stripPrefix:   cfg.dir.dist + path.sep,
			prependPrefix: 'static/',
			moduleName:    'cachedTemplates'
		},


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['dots'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: karma.LOG_DISABLE || karma.LOG_ERROR || karma.LOG_WARN || karma.LOG_INFO || karma.LOG_DEBUG
    logLevel: karma.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};
