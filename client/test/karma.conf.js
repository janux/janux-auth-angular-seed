var cfg = require('config'),
	path	= require('path');

// replaces literal 'dist/**/*.html' = ['ng-html2js']
// in preprocessors section further below
var preprocessors = {};
preprocessors[path.join(cfg.dir.dist,'**','*.html')] = ['ng-html2js'];

module.exports = function(karma) {
	karma.set({

		// base path that will be used to resolve all patterns (eg. files, exclude)
		basePath: '..',


		// frameworks to use
		// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
		frameworks: ['jasmine'],


		//
		// list of files / patterns to load in the browser;
		// the order of this list is important, load dependencies first
		//
		files: [
			path.join(cfg.dir.dist, cfg.file.app),
			path.join(cfg.dir.bower,'angular-mocks','angular-mocks.js'),
			{ pattern: path.join(cfg.dir.dist,'**','*.html'),  watched: true}
		].concat(cfg.fileset.test),


		// list of files to exclude
		exclude: [
		],


		// preprocess matching files before serving them to the browser
		// available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
		preprocessors: preprocessors,

		ngHtml2JsPreprocessor: {
			stripPrefix:	 cfg.dir.dist + path.sep,
			// prependPrefix: 'static/',
			moduleName:		 'cachedTemplates'
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
		// logLevel: karma.LOG_DEBUG,
		logLevel: karma.LOG_INFO,


		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: false,


		//
		// Start these browsers
		// available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
		//
		// PhantomJS by default, override via local config to specify a different browser
		//
		browsers: cfg.karma.browsers,


		//
		// Continuous Integration mode
		// if true, Karma captures browsers, runs the tests and exits
		//
		// True by default, set to false via local config when it is desirable to
		// troubleshoot using a browser's inspector, for example:
		//
		// - set 'debugger' statement in source code
		// - run 'gulp test'
		// - open browser at port above
		// - hit 'Debug' button
		// - Open dev tools
		// - refresh page
		//
		singleRun: cfg.karma.singleRun
	});
};
